import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Calendar,
  User,
  ArrowLeft,
  CalendarCheck,
  Phone,
  Share2,
} from 'lucide-react';
import { Metadata } from 'next';
import { generateBlogPostSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DEFAULT_BLOG_POSTS } from '@/lib/default-data';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let post: any = null;
  try {
    post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    });
  } catch (e) {
    // fallback
  }

  if (!post) {
    post = DEFAULT_BLOG_POSTS.find((p) => p.slug === params.slug);
  }

  if (!post) return { title: 'Article Not Found | VoltixNepal' };

  return {
    title: `${post.seoTitle || post.title} | VoltixNepal`,
    description: post.metaDescription || post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: [{ url: post.featuredImage }],
    },
  };
}

export const revalidate = 0;

export default async function BlogPostPage({ params }: Props) {
  let post: any = null;
  let related: any[] = [];
  let settings: any = DEFAULT_SETTINGS;

  try {
    post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    });
    if (post) {
      const [dbRelated, dbSettings] = await Promise.all([
        prisma.blogPost.findMany({
          where: {
            id: { not: post.id },
            isPublished: true,
          },
          take: 3,
          orderBy: { publishedAt: 'desc' },
        }).catch(() => []),
        prisma.websiteSettings.findUnique({
          where: { id: 'default_settings' },
        }).catch(() => null),
      ]);
      if (dbRelated) related = dbRelated;
      if (dbSettings) settings = dbSettings;
    }
  } catch (err) {
    console.warn('DB error in blog detail:', err);
  }

  if (!post) {
    post = DEFAULT_BLOG_POSTS.find((p) => p.slug === params.slug);
    related = DEFAULT_BLOG_POSTS.filter((p) => p.slug !== params.slug).slice(0, 3);
  }

  if (!post) {
    notFound();
  }

  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const businessPhone = settings?.phone || '+977 9800000000';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltixnepal.com';
  const blogSchema = generateBlogPostSchema(
    {
      title: post.title,
      excerpt: post.summary || post.metaDescription || post.title,
      author: post.author,
      imageUrl: post.featuredImage,
      slug: post.slug,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    },
    baseUrl
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Electrical Safety Blog', url: `${baseUrl}/blog` },
    { name: post.title, url: `${baseUrl}/blog/${post.slug}` },
  ]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-14 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="w-full px-4 sm:px-6 lg:px-12 py-2">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Safety Guides</span>
          </Link>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 lg:p-12 shadow-xs mb-10 w-full">
          <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            {post.category}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-5 mb-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              {dateStr}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-4 h-4 text-slate-400" />
              {post.author}
            </span>
          </div>

          {/* Featured Image - Full Screen Width Hero */}
          <div className="relative h-64 sm:h-96 lg:h-[500px] xl:h-[600px] w-full rounded-xl overflow-hidden bg-slate-100 mb-10">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Content Body with Markdown/Paragraph Rendering */}
          <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-800 leading-relaxed space-y-4">
            {post.content.split('\n\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="text-base sm:text-lg font-bold text-slate-900 pt-3"
                  >
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                return (
                  <div key={idx} className="pl-4 border-l-2 border-red-500 my-2 space-y-1 text-slate-700 text-xs sm:text-sm">
                    {paragraph.split('\n').map((line: string, i: number) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </div>

          {/* Author Footnote */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Written by</span>
              <span className="text-sm font-bold text-slate-900">{post.author}</span>
              <span className="text-xs text-slate-500 block">Lead Electrician at VoltixNepal</span>
            </div>
            <Link
              href="/request-service"
              className="btn-primary text-xs font-bold flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book an Inspection</span>
            </Link>
          </div>
        </article>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              More Safety Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="bg-white p-4 rounded-lg border border-slate-200 hover:border-red-300 shadow-2xs block transition-colors"
                >
                  <span className="text-[10px] font-bold text-red-600 uppercase">
                    {r.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                    {r.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
