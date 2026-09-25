import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendAdminNewRequestNotification, sendCustomerConfirmationEmail } from '@/lib/email';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { verifyAdminRequest } from '@/lib/auth-guard';

const requestSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(7, 'Please provide a valid phone number'),
  customerEmail: z.string().email('Please provide a valid email address'),
  preferredContact: z.enum(['WHATSAPP', 'PHONE', 'EMAIL']).default('WHATSAPP'),
  serviceId: z.string().optional(),
  serviceName: z.string().min(2, 'Please select or specify a service'),
  urgency: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']).default('NORMAL'),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  description: z.string().min(5, 'Please describe your electrical requirement or problem'),
  address: z.string().min(3, 'Address is required'),
  area: z.string().optional(),
  city: z.string().default('Kathmandu'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googleMapsUrl: z.string().nullable().optional(),
  additionalNotes: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Generate Request ID (e.g. VN-2026-000001)
    const currentYear = new Date().getFullYear();
    const count = await prisma.serviceRequest.count();
    const sequence = String(count + 1).padStart(6, '0');
    const requestId = `VN-${currentYear}-${sequence}`;

    // Auto-generate Google Maps URL if lat/lng are provided
    let mapsUrl = validated.googleMapsUrl;
    if (!mapsUrl && validated.latitude && validated.longitude) {
      mapsUrl = `https://www.google.com/maps?q=${validated.latitude},${validated.longitude}`;
    }

    // Save to Database
    const newRequest = await prisma.serviceRequest.create({
      data: {
        requestId,
        userId: validated.userId || null,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        customerEmail: validated.customerEmail || null,
        preferredContact: validated.preferredContact,
        serviceId: validated.serviceId || null,
        serviceName: validated.serviceName,
        urgency: validated.urgency,
        preferredDate: validated.preferredDate || null,
        preferredTime: validated.preferredTime || null,
        description: validated.description,
        address: validated.address,
        area: validated.area || null,
        city: validated.city || 'Kathmandu',
        latitude: validated.latitude || null,
        longitude: validated.longitude || null,
        googleMapsUrl: mapsUrl || null,
        additionalNotes: validated.additionalNotes || null,
        status: 'NEW',
      },
    });

    // Create Admin In-App Notification
    await prisma.notification.create({
      data: {
        type: 'SERVICE_REQUEST',
        title: `New ${validated.urgency} Request: ${validated.customerName}`,
        message: `${validated.serviceName} at ${validated.address}. Request ID: ${requestId}`,
        link: `/admin/requests/${newRequest.id}`,
        isRead: false,
      },
    });

    // Fetch current business settings for WhatsApp number and Email
    const settings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });
    const businessWhatsApp = settings?.whatsappNumber || '9779800000000';

    // Prepare WhatsApp Click-to-Chat URL
    const whatsappUrl = generateWhatsAppUrl(businessWhatsApp, {
      requestId,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail,
      serviceName: validated.serviceName,
      urgency: validated.urgency,
      preferredDate: validated.preferredDate,
      preferredTime: validated.preferredTime,
      description: validated.description,
      address: validated.address,
      area: validated.area,
      city: validated.city,
      googleMapsUrl: mapsUrl,
      latitude: validated.latitude,
      longitude: validated.longitude,
      additionalNotes: validated.additionalNotes,
    });

    // Dispatch Emails via SMTP in background (Non-blocking)
    const emailPayload = {
      ...newRequest,
      createdAt: newRequest.createdAt,
    };

    // Send to Admin
    sendAdminNewRequestNotification(emailPayload, settings?.email).catch((err) =>
      console.error('Background Admin Email error:', err)
    );

    // Send confirmation to Customer if email is present
    if (validated.customerEmail) {
      sendCustomerConfirmationEmail(emailPayload, {
        phone: settings?.phone,
        whatsappNumber: settings?.whatsappNumber,
        businessName: settings?.businessName,
      }).catch((err) => console.error('Background Customer Email error:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Service request submitted successfully.',
      requestId,
      request: newRequest,
      whatsappUrl,
    });
  } catch (error: any) {
    console.error('Error creating service request:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const query = searchParams.get('q');

    // If fetching for a specific customer
    if (userId) {
      const requests = await prisma.serviceRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, requests });
    }

    // Otherwise, admin access check
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const whereClause: any = {};
    if (status && status !== 'ALL') whereClause.status = status;
    if (urgency && urgency !== 'ALL') whereClause.urgency = urgency;
    if (query) {
      whereClause.OR = [
        { customerName: { contains: query } },
        { customerPhone: { contains: query } },
        { requestId: { contains: query } },
        { address: { contains: query } },
        { serviceName: { contains: query } },
      ];
    }

    const requests = await prisma.serviceRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
