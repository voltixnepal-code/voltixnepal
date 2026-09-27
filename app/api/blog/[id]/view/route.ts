import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DEFAULT_BLOG_POSTS } from '@/lib/default-data';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const identifier = params.id;

  if (!identifier) {
    return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
  }

  try {
    // Find post by ID or Slug
    const post = await prisma.blogPost.findFirst({
      where: { OR: [{ id: identifier }, { slug: identifier }] },
      select: { id: true, views: true },
    });

    if (post) {
      const updatedPost = await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          views: {
            increment: 1,
          },
        },
        select: {
          views: true,
        },
      });

      return NextResponse.json({
        success: true,
        views: updatedPost.views,
      });
    }
  } catch (err) {
    console.warn(`Error incrementing views for ${identifier}:`, err);
  }

  // If post is not in DB yet (e.g. static default post), create it in DB with views = 1
  const defaultPost = DEFAULT_BLOG_POSTS.find(
    (p) => p.slug === identifier || p.id === identifier
  );

  if (defaultPost) {
    try {
      const createdPost = await prisma.blogPost.create({
        data: {
          slug: defaultPost.slug,
          title: defaultPost.title,
          content: defaultPost.content,
          summary: defaultPost.summary,
          featuredImage: defaultPost.featuredImage,
          category: defaultPost.category,
          tags: defaultPost.tags || 'wiring,safety,home',
          author: defaultPost.author || 'Sanjit Mishra',
          views: 1,
          isPublished: true,
        },
        select: { views: true },
      });
      return NextResponse.json({
        success: true,
        views: createdPost.views,
      });
    } catch (createErr) {
      console.warn('Failed creating blog post on view:', createErr);
    }
  }

  return NextResponse.json({
    success: true,
    views: 1,
  });
}
