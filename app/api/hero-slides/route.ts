import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const slides = await prisma.heroSlide.findMany({
      where: all ? undefined : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, slides });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const newSlide = await prisma.heroSlide.create({
      data: {
        badge: body.badge || 'PROFESSIONAL ELECTRICAL SERVICES',
        title: body.title,
        description: body.description,
        primaryBtnText: body.primaryBtnText || 'Request a Service',
        primaryBtnLink: body.primaryBtnLink || '/request-service',
        secondaryBtnText: body.secondaryBtnText || null,
        secondaryBtnLink: body.secondaryBtnLink || null,
        imageUrl: body.imageUrl,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'CREATE_HERO_SLIDE',
        entityType: 'HeroSlide',
        entityId: newSlide.id,
        details: `Created slide: ${newSlide.title}`,
      },
    });

    return NextResponse.json({ success: true, slide: newSlide });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
