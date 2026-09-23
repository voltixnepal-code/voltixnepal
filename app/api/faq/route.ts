import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const faqs = await prisma.faq.findMany({
      where: all ? undefined : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, faqs });
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
    const newFaq = await prisma.faq.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category || 'General',
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'CREATE_FAQ',
        entityType: 'Faq',
        entityId: newFaq.id,
        details: `Created FAQ: ${newFaq.question}`,
      },
    });

    return NextResponse.json({ success: true, faq: newFaq });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
