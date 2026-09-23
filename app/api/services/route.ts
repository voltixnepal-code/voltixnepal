import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const services = await prisma.service.findMany({
      where: all ? undefined : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, services });
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

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newService = await prisma.service.create({
      data: {
        slug,
        title: body.title,
        shortDescription: body.shortDescription,
        fullDescription: body.fullDescription,
        category: body.category || 'Residential',
        priceDisplay: body.priceDisplay || null,
        imageUrl:
          body.imageUrl ||
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        iconName: body.iconName || 'Zap',
        benefits: JSON.stringify(body.benefits || []),
        includedItems: JSON.stringify(body.includedItems || []),
        whenNeeded: JSON.stringify(body.whenNeeded || []),
        serviceArea: body.serviceArea || 'Kathmandu Valley',
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'CREATE_SERVICE',
        entityType: 'Service',
        entityId: newService.id,
        details: `Created service: ${newService.title}`,
      },
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
