import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const service = await prisma.service.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

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

    const existing = await prisma.service.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.service.update({
      where: { id: existing.id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        slug: body.slug !== undefined ? body.slug : existing.slug,
        shortDescription:
          body.shortDescription !== undefined
            ? body.shortDescription
            : existing.shortDescription,
        fullDescription:
          body.fullDescription !== undefined
            ? body.fullDescription
            : existing.fullDescription,
        category:
          body.category !== undefined ? body.category : existing.category,
        priceDisplay:
          body.priceDisplay !== undefined
            ? body.priceDisplay
            : existing.priceDisplay,
        imageUrl:
          body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        iconName:
          body.iconName !== undefined ? body.iconName : existing.iconName,
        benefits:
          body.benefits !== undefined
            ? typeof body.benefits === 'string'
              ? body.benefits
              : JSON.stringify(body.benefits)
            : existing.benefits,
        includedItems:
          body.includedItems !== undefined
            ? typeof body.includedItems === 'string'
              ? body.includedItems
              : JSON.stringify(body.includedItems)
            : existing.includedItems,
        whenNeeded:
          body.whenNeeded !== undefined
            ? typeof body.whenNeeded === 'string'
              ? body.whenNeeded
              : JSON.stringify(body.whenNeeded)
            : existing.whenNeeded,
        serviceArea:
          body.serviceArea !== undefined
            ? body.serviceArea
            : existing.serviceArea,
        isActive:
          body.isActive !== undefined ? body.isActive : existing.isActive,
        sortOrder:
          body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_SERVICE',
        entityType: 'Service',
        entityId: updated.id,
        details: `Updated service: ${updated.title}`,
      },
    });

    return NextResponse.json({ success: true, service: updated });
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
    const existing = await prisma.service.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id: existing.id },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'DELETE_SERVICE',
        entityType: 'Service',
        entityId: existing.id,
        details: `Deleted service: ${existing.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
