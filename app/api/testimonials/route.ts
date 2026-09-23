import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const testimonials = await prisma.testimonial.findMany({
      where: all ? undefined : { isApproved: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if submitted by admin (auto-approve) or public customer (pending approval)
    const auth = await verifyAdminRequest(req);
    const isApproved = auth.isAdmin ? (body.isApproved ?? true) : false;

    const newTestimonial = await prisma.testimonial.create({
      data: {
        customerName: body.customerName,
        location: body.location || 'Kathmandu',
        rating: body.rating || 5,
        content: body.content,
        date: body.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        photoUrl: body.photoUrl || null,
        isApproved,
      },
    });

    return NextResponse.json({ success: true, testimonial: newTestimonial });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
