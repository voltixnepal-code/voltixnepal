import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    const whereClause: any = {};
    if (!all) whereClause.isPublished = true;
    if (category && category !== 'ALL') whereClause.category = category;
    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { summary: { contains: query } },
        { content: { contains: query } },
        { tags: { contains: query } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ success: true, posts });
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

    const newPost = await prisma.blogPost.create({
      data: {
        slug,
        title: body.title,
        summary: body.summary,
        content: body.content,
        featuredImage:
          body.featuredImage ||
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
        category: body.category || 'Electrical Safety',
        tags: body.tags || 'electrical,nepal',
        author: body.author || 'Sanjeet Mishra',
        seoTitle: body.seoTitle || body.title,
        metaDescription: body.metaDescription || body.summary,
        isPublished: body.isPublished ?? true,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'CREATE_BLOG_POST',
        entityType: 'BlogPost',
        entityId: newPost.id,
        details: `Created blog post: ${newPost.title}`,
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
