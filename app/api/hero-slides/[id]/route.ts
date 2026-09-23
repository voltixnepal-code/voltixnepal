import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.heroSlide.update({
      where: { id },
      data: {
        badge: body.badge,
        title: body.title,
        description: body.description,
        primaryBtnText: body.primaryBtnText,
        primaryBtnLink: body.primaryBtnLink,
        secondaryBtnText: body.secondaryBtnText,
        secondaryBtnLink: body.secondaryBtnLink,
        imageUrl: body.imageUrl,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_HERO_SLIDE',
        entityType: 'HeroSlide',
        entityId: id,
        details: `Updated slide: ${updated.title}`,
      },
    });

    return NextResponse.json({ success: true, slide: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    await prisma.heroSlide.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'DELETE_HERO_SLIDE',
        entityType: 'HeroSlide',
        entityId: id,
        details: `Deleted hero slide ${id}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Slide deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
