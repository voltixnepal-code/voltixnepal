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

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName: body.customerName,
        location: body.location,
        rating: body.rating,
        content: body.content,
        date: body.date,
        photoUrl: body.photoUrl,
        isApproved: body.isApproved,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_TESTIMONIAL',
        entityType: 'Testimonial',
        entityId: id,
        details: `Updated testimonial from ${updated.customerName}`,
      },
    });

    return NextResponse.json({ success: true, testimonial: updated });
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
    await prisma.testimonial.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'DELETE_TESTIMONIAL',
        entityType: 'Testimonial',
        entityId: id,
        details: `Deleted testimonial ${id}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Testimonial deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
