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
  Clock,
  Tag,
  ArrowRight,
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
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  } catch (e) {}

  if (!post) post = DEFAULT_BLOG_POSTS.find((p) => p.slug === params.slug);
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
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
    if (post) {
      const [dbRelated, dbSettings] = await Promise.all([
        prisma.blogPost.findMany({
          where: { id: { not: post.id }, isPublished: true },
          take: 3,
          orderBy: { publishedAt: 'desc' },
        }).catch(() => []),
        prisma.websiteSettings.findUnique({ where: { id: 'default_settings' } }).catch(() => null),
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

  if (!post) notFound();

  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const readingTime = Math.max(1, Math.ceil(post.content.split(' ').length / 200));
  const businessPhone = settings?.phone || '+977 9825870047';
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
    { name: 'Blog', url: `${baseUrl}/blog` },
    { name: post.title, url: `${baseUrl}/blog/${post.slug}` },
  ]);

  // Parse content into blocks
  const blocks = post.content.split('\n\n').map((block: string, idx: number) => {
    if (block.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-2xl sm:text-3xl font-bold text-slate-900 mt-10 mb-4 leading-tight">
          {block.replace('## ', '')}
        </h2>
      );
    }
    if (block.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3 leading-snug">
          {block.replace('### ', '')}
        </h3>
      );
    }
    if (block.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-lg font-semibold text-slate-800 mt-6 mb-2">
          {block.replace('#### ', '')}
        </h4>
      );
    }
    if (block.startsWith('- ') || block.startsWith('* ')) {
      const lines = block.split('\n').filter(Boolean);
      return (
        <ul key={idx} className="my-4 space-y-2 pl-2">
          {lines.map((line: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-slate-700 text-base leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{line.replace(/^[-*]\s/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(block)) {
      const lines = block.split('\n').filter(Boolean);
      return (
        <ol key={idx} className="my-4 space-y-2 pl-2 list-none">
          {lines.map((line: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-slate-700 text-base leading-relaxed">
              <span className="mt-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span>{line.replace(/^\d+\.\s/, '')}</span>
            </li>
          ))}
        </ol>
      );
    }
    if (block.startsWith('> ')) {
      return (
        <blockquote key={idx} className="my-6 pl-5 border-l-4 border-red-500 bg-red-50 py-4 pr-4 rounded-r-lg">
          <p className="text-slate-800 italic text-base leading-relaxed">{block.replace('> ', '')}</p>
        </blockquote>
      );
    }
    if (block.trim() === '') return null;
    return (
      <p key={idx} className="text-slate-700 text-base sm:text-lg leading-relaxed my-4">
        {block}
      </p>
    );
  });

  return (
    <div className="bg-white min-h-screen w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Full-width Hero Image */}
      <div className="w-full relative h-[320px] sm:h-[450px] lg:h-[560px] bg-slate-900 overflow-hidden">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Back link inside hero */}
        <div className="absolute top-6 left-0 w-full px-4 sm:px-8 lg:px-16 z-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Hero text overlay */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 lg:px-16 pb-10 z-10">
          <div className="max-w-4xl">
            <span className="inline-block px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold mb-4">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {dateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full px-4 sm:px-8 lg:px-16 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            {/* Article Body */}
            <main className="lg:col-span-8">
              {/* Summary / Intro box */}
              {post.summary && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 mb-8">
                  <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal italic">
                    {post.summary}
                  </p>
                </div>
              )}

              {/* Article content */}
              <article className="text-slate-800">
                {blocks}
              </article>

              {/* Author card */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-sm">
                    {post.author?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Written by</p>
                    <p className="text-base font-bold text-slate-900">{post.author}</p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Lead Electrician & Proprietor at VoltixNepal. Certified electrical contractor with 10+ years of residential and commercial wiring experience across Kathmandu Valley.
                    </p>
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline mt-2"
                    >
                      View Profile <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">

              {/* Sticky CTA */}
              <div className="sticky top-24 space-y-6">
                <div className="bg-red-600 text-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-extrabold mb-2">Need Electrical Help?</h3>
                  <p className="text-sm text-red-100 leading-relaxed mb-4">
                    Sanjit Mishra is available for on-site inspections, emergency repairs, and new installations across Kathmandu.
                  </p>
                  <Link
                    href="/request-service"
                    className="flex items-center justify-center gap-2 w-full bg-white text-red-600 font-bold text-sm py-3 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Book a Service
                  </Link>
                  <a
                    href={`tel:${businessPhone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-2 w-full mt-2 border border-white/30 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Call: {businessPhone}
                  </a>
                </div>

                {/* Related articles */}
                {related.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">
                      More Articles
                    </h4>
                    <div className="space-y-4">
                      {related.map((r: any) => (
                        <Link
                          key={r.id}
                          href={`/blog/${r.slug}`}
                          className="group flex gap-3 items-start"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            <Image
                              src={r.featuredImage}
                              alt={r.title}
                              fill
                              sizes="64px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-red-600 uppercase">{r.category}</span>
                            <h5 className="text-xs font-semibold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-2 mt-0.5 leading-snug">
                              {r.title}
                            </h5>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category tag */}
                <div className="flex items-center gap-2 pt-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.category)}`}
                    className="text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 transition-colors"
                  >
                    {post.category}
                  </Link>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>

      {/* Bottom Related Posts Strip */}
      {related.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 py-12 w-full px-4 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">More Safety Guides</h3>
              <Link href="/blog" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r: any) => {
                const rDate = new Date(r.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={r.featuredImage}
                        alt={r.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-red-600 text-white text-xs font-semibold">
                          {r.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-slate-400 mb-1">{rDate}</p>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {r.title}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
