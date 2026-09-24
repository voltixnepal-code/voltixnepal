import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Gallery item not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const updatedItem = await prisma.galleryItem.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        mediaType: body.mediaType !== undefined ? body.mediaType : undefined,
        storageProvider: body.storageProvider !== undefined ? body.storageProvider : undefined,
        mediaUrl: body.mediaUrl !== undefined ? body.mediaUrl : undefined,
        thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : undefined,
        category: body.category !== undefined ? body.category : undefined,
        location: body.location !== undefined ? body.location : undefined,
        dateTaken: body.dateTaken ? new Date(body.dateTaken) : undefined,
        isPublished: body.isPublished !== undefined ? body.isPublished : undefined,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_GALLERY_ITEM',
        entityType: 'GalleryItem',
        entityId: updatedItem.id,
        details: `Updated gallery item: ${updatedItem.title}`,
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
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
        { success: false, message: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const existing = await prisma.galleryItem.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Gallery item not found.' },
        { status: 404 }
      );
    }

    await prisma.galleryItem.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'DELETE_GALLERY_ITEM',
        entityType: 'GalleryItem',
        entityId: params.id,
        details: `Deleted gallery item: ${existing.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
