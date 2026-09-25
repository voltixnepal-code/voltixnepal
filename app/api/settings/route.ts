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

    const updated = await (prisma as any).websiteSettings.upsert({
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
        aboutTitle: body.aboutTitle,
        aboutSubtitle: body.aboutSubtitle,
        aboutStory: body.aboutStory,
        aboutMission: body.aboutMission,
        aboutVision: body.aboutVision,
        aboutOwnerTitle: body.aboutOwnerTitle,
        aboutOwnerBio: body.aboutOwnerBio,
        aboutOwnerPhoto: body.aboutOwnerPhoto,
        aboutCoverPhoto: body.aboutCoverPhoto,
        aboutExperienceYears: typeof body.aboutExperienceYears === 'number' ? body.aboutExperienceYears : (body.aboutExperienceYears ? parseInt(body.aboutExperienceYears, 10) : 10),
        aboutProjectsDone: typeof body.aboutProjectsDone === 'number' ? body.aboutProjectsDone : (body.aboutProjectsDone ? parseInt(body.aboutProjectsDone, 10) : 1500),
        aboutHappyClients: typeof body.aboutHappyClients === 'number' ? body.aboutHappyClients : (body.aboutHappyClients ? parseInt(body.aboutHappyClients, 10) : 1200),
      } as any,
      create: {
        id: 'default_settings',
        ...body,
      } as any,
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

export async function POST(req: NextRequest) {
  return PUT(req);
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}

