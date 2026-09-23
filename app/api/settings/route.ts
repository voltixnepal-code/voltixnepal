import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export async function GET() {
  try {
    let settings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });

    if (!settings) {
      settings = await prisma.websiteSettings.create({
        data: { id: 'default_settings', ...DEFAULT_SETTINGS },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: error.message, settings: DEFAULT_SETTINGS },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const updated = await prisma.websiteSettings.upsert({
      where: { id: 'default_settings' },
      update: {
        businessName: body.businessName,
        ownerName: body.ownerName,
        tagline: body.tagline,
        phone: body.phone,
        whatsappNumber: body.whatsappNumber,
        email: body.email,
        address: body.address,
        businessHours: body.businessHours,
        emergencyAvailable: body.emergencyAvailable ?? true,
        emergencyPhone: body.emergencyPhone || body.phone,
        googleMapsUrl: body.googleMapsUrl,
        footerText: body.footerText,
        announcementText: body.announcementText,
        announcementActive: body.announcementActive ?? false,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        tiktokUrl: body.tiktokUrl,
        youtubeUrl: body.youtubeUrl,
      },
      create: {
        id: 'default_settings',
        ...body,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_SETTINGS',
        entityType: 'WebsiteSettings',
        entityId: 'default_settings',
        details: 'Updated global business settings',
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
