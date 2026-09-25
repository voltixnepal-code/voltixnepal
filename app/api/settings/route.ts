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

    const updateData: any = {};
    if (body.businessName !== undefined) updateData.businessName = body.businessName;
    if (body.ownerName !== undefined) updateData.ownerName = body.ownerName;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.whatsappNumber !== undefined) updateData.whatsappNumber = body.whatsappNumber;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.businessHours !== undefined) updateData.businessHours = body.businessHours;
    if (body.emergencyAvailable !== undefined) updateData.emergencyAvailable = Boolean(body.emergencyAvailable);
    if (body.emergencyPhone !== undefined) updateData.emergencyPhone = body.emergencyPhone;
    if (body.googleMapsUrl !== undefined) updateData.googleMapsUrl = body.googleMapsUrl;
    if (body.footerText !== undefined) updateData.footerText = body.footerText;
    if (body.announcementText !== undefined) updateData.announcementText = body.announcementText;
    if (body.announcementActive !== undefined) updateData.announcementActive = Boolean(body.announcementActive);
    if (body.facebookUrl !== undefined) updateData.facebookUrl = body.facebookUrl;
    if (body.instagramUrl !== undefined) updateData.instagramUrl = body.instagramUrl;
    if (body.tiktokUrl !== undefined) updateData.tiktokUrl = body.tiktokUrl;
    if (body.youtubeUrl !== undefined) updateData.youtubeUrl = body.youtubeUrl;
    if (body.aboutTitle !== undefined) updateData.aboutTitle = body.aboutTitle;
    if (body.aboutSubtitle !== undefined) updateData.aboutSubtitle = body.aboutSubtitle;
    if (body.aboutStory !== undefined) updateData.aboutStory = body.aboutStory;
    if (body.aboutMission !== undefined) updateData.aboutMission = body.aboutMission;
    if (body.aboutVision !== undefined) updateData.aboutVision = body.aboutVision;
    if (body.aboutOwnerTitle !== undefined) updateData.aboutOwnerTitle = body.aboutOwnerTitle;
    if (body.aboutOwnerBio !== undefined) updateData.aboutOwnerBio = body.aboutOwnerBio;
    if (body.aboutOwnerPhoto !== undefined) updateData.aboutOwnerPhoto = body.aboutOwnerPhoto;
    if (body.aboutCoverPhoto !== undefined) updateData.aboutCoverPhoto = body.aboutCoverPhoto;
    if (body.aboutExperienceYears !== undefined) updateData.aboutExperienceYears = typeof body.aboutExperienceYears === 'number' ? body.aboutExperienceYears : parseInt(body.aboutExperienceYears, 10) || 10;
    if (body.aboutProjectsDone !== undefined) updateData.aboutProjectsDone = typeof body.aboutProjectsDone === 'number' ? body.aboutProjectsDone : parseInt(body.aboutProjectsDone, 10) || 1500;
    if (body.aboutHappyClients !== undefined) updateData.aboutHappyClients = typeof body.aboutHappyClients === 'number' ? body.aboutHappyClients : parseInt(body.aboutHappyClients, 10) || 1200;
    if (body.aboutHeadline !== undefined) updateData.aboutHeadline = body.aboutHeadline;
    if (body.aboutBio1 !== undefined) updateData.aboutBio1 = body.aboutBio1;
    if (body.aboutBio2 !== undefined) updateData.aboutBio2 = body.aboutBio2;
    if (body.aboutHighlights !== undefined) {
      updateData.aboutHighlights = typeof body.aboutHighlights === 'string' ? body.aboutHighlights : JSON.stringify(body.aboutHighlights);
    }
    if (body.aboutBookBtnText !== undefined) updateData.aboutBookBtnText = body.aboutBookBtnText;

    const updated = await prisma.websiteSettings.upsert({
      where: { id: 'default_settings' },
      update: updateData,
      create: {
        id: 'default_settings',
        ...DEFAULT_SETTINGS,
        ...updateData,
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

export async function POST(req: NextRequest) {
  return PUT(req);
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}

