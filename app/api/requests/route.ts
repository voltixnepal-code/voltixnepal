// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendAdminNewRequestNotification, sendCustomerConfirmationEmail } from '@/lib/email';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { verifyAdminRequest } from '@/lib/auth-guard';

const db: any = prisma;

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
  customerLocationName: z.string().optional(),
  ipAddress: z.string().optional(),
});

async function generateUniqueRequestId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `VN-${currentYear}-`;

  // Fetch the latest requests for the current year to find the maximum existing sequence number
  const latestRequests = await prisma.serviceRequest.findMany({
    where: {
      requestId: {
        startsWith: prefix,
      },
    },
    select: {
      requestId: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  let maxSequence = 0;
  for (const req of latestRequests) {
    const parts = req.requestId.split('-');
    if (parts.length >= 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSequence) {
        maxSequence = num;
      }
    }
  }

  const count = await prisma.serviceRequest.count();
  let nextSeq = Math.max(maxSequence + 1, count + 1);

  // Guarantee uniqueness by verifying against database
  while (true) {
    const candidateId = `${prefix}${String(nextSeq).padStart(6, '0')}`;
    const exists = await prisma.serviceRequest.findUnique({
      where: { requestId: candidateId },
      select: { id: true },
    });
    if (!exists) {
      return candidateId;
    }
    nextSeq++;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const detectedIp =
      cfConnectingIp ||
      realIp ||
      (forwarded ? forwarded.split(',')[0].trim() : null) ||
      validated.ipAddress ||
      null;

    // Auto-generate Google Maps URL if lat/lng are provided
    let mapsUrl = validated.googleMapsUrl;
    if (!mapsUrl && validated.latitude && validated.longitude) {
      mapsUrl = `https://www.google.com/maps?q=${validated.latitude},${validated.longitude}`;
    }

    // Try linking with an existing user by userId or email
    let linkedUserId: string | null = null;
    if (validated.userId) {
      const userMatch = await prisma.user.findFirst({
        where: { OR: [{ id: validated.userId }, { firebaseUid: validated.userId }] },
        select: { id: true },
      });
      if (userMatch) linkedUserId = userMatch.id;
    }
    if (!linkedUserId && validated.customerEmail) {
      const userMatch = await prisma.user.findFirst({
        where: { email: { equals: validated.customerEmail.trim().toLowerCase(), mode: 'insensitive' } },
        select: { id: true },
      });
      if (userMatch) linkedUserId = userMatch.id;
    }

    // Save to Database with collision-retry mechanism
    let newRequest;
    let requestId = '';
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        requestId = await generateUniqueRequestId();
        newRequest = await db.serviceRequest.create({
          data: {
            requestId,
            userId: linkedUserId,
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
            customerLocationName: validated.customerLocationName || null,
            ipAddress: detectedIp,
            additionalNotes: validated.additionalNotes || null,
            status: 'NEW',
          },
        });
        break; // Successfully created!
      } catch (err: any) {
        if (err.code === 'P2002' && attempt < maxAttempts) {
          console.warn(`RequestId collision on ${requestId}, retrying (attempt ${attempt}/${maxAttempts})...`);
          continue;
        }
        throw err;
      }
    }

    if (!newRequest) {
      throw new Error('Failed to create service request after multiple attempts.');
    }

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
    const businessWhatsApp = settings?.whatsappNumber || '9779825870047';

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

    // Dispatch Emails via SMTP (Awaited with allSettled to guarantee delivery on Vercel/serverless)
    const emailPayload = {
      ...newRequest,
      createdAt: newRequest.createdAt,
    };

    try {
      await Promise.allSettled([
        sendAdminNewRequestNotification(emailPayload, settings?.email),
        validated.customerEmail
          ? sendCustomerConfirmationEmail(emailPayload, {
              phone: settings?.phone,
              whatsappNumber: settings?.whatsappNumber,
              businessName: settings?.businessName,
            })
          : Promise.resolve(),
      ]);
    } catch (emailErr) {
      console.error('SMTP Dispatch error:', emailErr);
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
      {
        success: false,
        message:
          error?.code === 'P2002'
            ? 'A request with this ID already exists. Please try submitting again.'
            : (error.message || 'Internal server error')
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const customerEmail = searchParams.get('email');
    const customerPhone = searchParams.get('phone');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const query = searchParams.get('q');

    // If fetching for a specific customer (by userId, email, or phone)
    if (userId || customerEmail || customerPhone) {
      const orConditions: any[] = [];
      const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : null;
      const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, '').slice(-10) : null;

      if (userId) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: userId }, { firebaseUid: userId }] },
        });
        if (user) {
          orConditions.push({ userId: user.id });
          if (user.email) {
            orConditions.push({ customerEmail: { equals: user.email.trim().toLowerCase(), mode: 'insensitive' } });
          }
          if (user.phone) {
            const uPhone = user.phone.replace(/\D/g, '').slice(-10);
            if (uPhone.length >= 7) {
              orConditions.push({ customerPhone: { contains: uPhone } });
            }
          }

          // Automatically auto-link any past guest requests for this customer to ensure lifetime history
          const emailToLink = user.email || cleanEmail;
          if (emailToLink) {
            await prisma.serviceRequest.updateMany({
              where: {
                userId: null,
                customerEmail: { equals: emailToLink.trim().toLowerCase(), mode: 'insensitive' },
              },
              data: {
                userId: user.id,
              },
            }).catch(() => {});
          }
        } else {
          orConditions.push({ userId });
        }
      }

      if (cleanEmail) {
        orConditions.push({ customerEmail: { equals: cleanEmail, mode: 'insensitive' } });
      }

      if (cleanPhone && cleanPhone.length >= 7) {
        orConditions.push({ customerPhone: { contains: cleanPhone } });
      }

      const requests = await prisma.serviceRequest.findMany({
        where: orConditions.length > 0 ? { OR: orConditions } : {},
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
        { customerName: { contains: query, mode: 'insensitive' } },
        { customerPhone: { contains: query } },
        { requestId: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { serviceName: { contains: query, mode: 'insensitive' } },
      ];
    }

    const requests = await prisma.serviceRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const allUserRequests = await prisma.serviceRequest.findMany({
      select: { customerPhone: true, customerEmail: true },
    });

    const phoneCountMap: Record<string, number> = {};
    const emailCountMap: Record<string, number> = {};

    allUserRequests.forEach((r) => {
      const cleanPhone = (r.customerPhone || '').replace(/\D/g, '');
      if (cleanPhone) {
        phoneCountMap[cleanPhone] = (phoneCountMap[cleanPhone] || 0) + 1;
      }
      const cleanEmail = (r.customerEmail || '').trim().toLowerCase();
      if (cleanEmail) {
        emailCountMap[cleanEmail] = (emailCountMap[cleanEmail] || 0) + 1;
      }
    });

    const decoratedRequests = requests.map((r) => {
      const cleanPhone = (r.customerPhone || '').replace(/\D/g, '');
      const cleanEmail = (r.customerEmail || '').trim().toLowerCase();
      const count =
        phoneCountMap[cleanPhone] || emailCountMap[cleanEmail] || 1;
      return {
        ...r,
        customerRequestCount: count,
      };
    });

    return NextResponse.json({ success: true, requests: decoratedRequests });
  } catch (error: any) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
