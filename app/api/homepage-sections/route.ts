import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, sections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
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

    const body = await req.json(); // Expecting array of { sectionKey, label, isEnabled, sortOrder }
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload, expected array' },
        { status: 400 }
      );
    }

    for (const sec of sections) {
      await prisma.homepageSection.upsert({
        where: { sectionKey: sec.sectionKey },
        update: {
          isEnabled: sec.isEnabled,
          sortOrder: sec.sortOrder,
          label: sec.label,
        },
        create: {
          sectionKey: sec.sectionKey,
          label: sec.label,
          isEnabled: sec.isEnabled,
          sortOrder: sec.sortOrder,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_HOMEPAGE_SECTIONS',
        entityType: 'HomepageSection',
        details: 'Updated homepage sections visibility and ordering',
      },
    });

    const updated = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, sections: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
