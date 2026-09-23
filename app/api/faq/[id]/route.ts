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

    const updated = await prisma.faq.update({
      where: { id },
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_FAQ',
        entityType: 'Faq',
        entityId: id,
        details: `Updated FAQ: ${updated.question}`,
      },
    });

    return NextResponse.json({ success: true, faq: updated });
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
    await prisma.faq.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'DELETE_FAQ',
        entityType: 'Faq',
        entityId: id,
        details: `Deleted FAQ ${id}`,
      },
    });

    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
