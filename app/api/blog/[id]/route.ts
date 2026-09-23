import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const post = await prisma.blogPost.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }

    // Also fetch 3 related posts
    const related = await prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        isPublished: true,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ success: true, post, related });
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

    const existing = await prisma.blogPost.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        title: body.title,
        slug: body.slug,
        summary: body.summary,
        content: body.content,
        featuredImage: body.featuredImage,
        category: body.category,
        tags: body.tags,
        author: body.author,
        seoTitle: body.seoTitle,
        metaDescription: body.metaDescription,
        isPublished: body.isPublished,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'UPDATE_BLOG_POST',
        entityType: 'BlogPost',
        entityId: updated.id,
        details: `Updated blog post: ${updated.title}`,
      },
    });

    return NextResponse.json({ success: true, post: updated });
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
    const existing = await prisma.blogPost.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'DELETE_BLOG_POST',
        entityType: 'BlogPost',
        entityId: existing.id,
        details: `Deleted blog post: ${existing.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
