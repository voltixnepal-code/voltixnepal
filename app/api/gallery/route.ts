import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';
import { z } from 'zod';

const createGalleryItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  mediaType: z.enum(['PHOTO', 'VIDEO']).default('PHOTO'),
  storageProvider: z.enum(['CLOUDINARY', 'CLOUDFLARE_R2', 'EXTERNAL']).default('CLOUDINARY'),
  mediaUrl: z.string().url('A valid media URL is required'),
  thumbnailUrl: z.string().optional().nullable(),
  fileSizeBytes: z.number().optional().nullable(),
  category: z.string().default('House Wiring'),
  location: z.string().default('Kathmandu Valley'),
  dateTaken: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    const whereClause: any = {};
    if (!all) whereClause.isPublished = true;
    if (type && type !== 'ALL') whereClause.mediaType = type;
    if (category && category !== 'ALL') whereClause.category = category;
    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { location: { contains: query } },
        { category: { contains: query } },
      ];
    }

    const items = await prisma.galleryItem.findMany({
      where: whereClause,
      orderBy: [
        { sortOrder: 'asc' },
        { dateTaken: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Gallery GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch gallery items.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createGalleryItemSchema.parse(body);

    const newItem = await prisma.galleryItem.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        mediaType: parsed.mediaType,
        storageProvider: parsed.storageProvider,
        mediaUrl: parsed.mediaUrl,
        thumbnailUrl: parsed.thumbnailUrl || (parsed.mediaType === 'PHOTO' ? parsed.mediaUrl : null),
        fileSizeBytes: parsed.fileSizeBytes,
        category: parsed.category,
        location: parsed.location,
        dateTaken: parsed.dateTaken ? new Date(parsed.dateTaken) : new Date(),
        isPublished: parsed.isPublished,
        sortOrder: parsed.sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'CREATE_GALLERY_ITEM',
        entityType: 'GalleryItem',
        entityId: newItem.id,
        details: `Created gallery item: ${newItem.title} (${newItem.mediaType} via ${newItem.storageProvider})`,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Gallery POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create gallery item.' },
      { status: 500 }
    );
  }
}
