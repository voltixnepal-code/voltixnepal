import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Calendar, User, Clock, Eye, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import { generateBlogPostSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DEFAULT_BLOG_POSTS } from '@/lib/default-data';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import BlogSidebar from '@/components/blog/BlogSidebar';
import ViewCounter from '@/components/blog/ViewCounter';

interface Props {
  params: { slug: string };
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let post: any = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  } catch {}
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
  let recentPosts: any[] = [];
  let settings: any = DEFAULT_SETTINGS;

  try {
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
    if (post) {
      const [dbRecent, dbSettings] = await Promise.all([
        prisma.blogPost
          .findMany({
            where: { id: { not: post.id }, isPublished: true },
            take: 4,
            orderBy: { publishedAt: 'desc' },
          })
          .catch(() => []),
        prisma.websiteSettings
          .findUnique({ where: { id: 'default_settings' } })
          .catch(() => null),
      ]);
      if (dbRecent) recentPosts = dbRecent;
      if (dbSettings) settings = dbSettings;
    }
  } catch (err) {
    console.warn('DB error:', err);
  }

  if (!post) {
    post = DEFAULT_BLOG_POSTS.find((p) => p.slug === params.slug);
    recentPosts = DEFAULT_BLOG_POSTS.filter((p) => p.slug !== params.slug).slice(0, 4);
  }
  if (!post) notFound();

  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
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

  // Content block renderer
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block: string, idx: number) => {
      if (!block.trim()) return null;

      if (block.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-4 leading-tight tracking-tight"
          >
            {block.replace(/^## /, '')}
          </h2>
        );
      }
      if (block.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-lg sm:text-xl font-semibold text-slate-900 mt-6 mb-3"
          >
            {block.replace(/^### /, '')}
          </h3>
        );
      }
      if (block.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-base font-semibold text-slate-800 mt-5 mb-2">
            {block.replace(/^#### /, '')}
          </h4>
        );
      }
      if (block.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-red-500 pl-4 py-3 my-6 bg-red-50/50 rounded-r-lg"
          >
            <p className="text-slate-700 italic text-base leading-relaxed">
              {block.replace(/^> /, '')}
            </p>
          </blockquote>
        );
      }
      if (block.startsWith('- ') || block.startsWith('* ')) {
        const lines = block.split('\n').filter(Boolean);
        return (
          <ul key={idx} className="my-4 space-y-2 pl-1">
            {lines.map((line: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-slate-600 text-base leading-relaxed">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{line.replace(/^[-*]\s/, '')}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (/^\d+\.\s/.test(block)) {
        const lines = block.split('\n').filter(Boolean);
        return (
          <ol key={idx} className="my-4 space-y-2.5 pl-1 list-none">
            {lines.map((line: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-slate-600 text-base leading-relaxed">
                <span className="shrink-0 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center mt-0.5 shadow-xs">
                  {i + 1}
                </span>
                <span>{line.replace(/^\d+\.\s/, '')}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <p key={idx} className="text-slate-600 text-base sm:text-[17px] leading-[1.85] my-4">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 relative overflow-hidden">
      {/* Decorative subtle ambient background shapes matching bishalcodes design */}
      <div className="absolute top-10 left-[-100px] w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-[-100px] w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-10 relative z-10">
        
        {/* Main white container card matching bishalcodes layout */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-xs">
          
          {/* Top Breadcrumb row */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-red-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </li>
              <li>
                <Link href="/blog" className="hover:text-red-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </li>
              <li className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Article H1 Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          {/* Metadata info line matching bishalcodes: Author • Date • Category • Read Time • Views */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 pb-6 border-b border-slate-200/80 mb-8">
            <span className="font-medium text-slate-800">{post.author}</span>
            <span className="text-slate-300">•</span>
            <span>{dateStr}</span>
            <span className="text-slate-300">•</span>
            <span className="text-red-600 font-semibold hover:underline cursor-pointer">
              {post.category}
            </span>
            <span className="text-slate-300">•</span>
            <span>{readingTime} min read</span>
            <span className="text-slate-300">•</span>
            <ViewCounter slug={post.slug} initialViews={post.views || 0} />
          </div>


          {/* 2-Column Grid Layout: Main Article Left + Sidebar Right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-10">
            
            {/* Left Column: Article Body */}
            <article className="min-w-0">
              
              {/* Featured Image */}
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-xs mb-4">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 768px"
                  className="object-cover"
                />
              </div>

              {/* Author attribution row directly below featured image */}
              <div className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-100 mb-8">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {post.author?.charAt(0) || 'S'}
                </div>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">By {post.author}</span> — Lead Electrician & Electrical Contractor at VoltixNepal
                </p>
              </div>

              {/* Summary lead text */}
              {post.summary && (
                <div className="p-4 bg-slate-50 border-l-4 border-red-500 rounded-r-lg mb-6">
                  <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              )}

              {/* Parsed Post Body */}
              <div className="prose prose-slate max-w-none">
                {renderContent(post.content)}
              </div>

              {/* Author Bio & Service CTA Box at bottom of article */}
              <div className="mt-12 pt-8 border-t border-slate-200/80 space-y-6">
                
                {/* Author card */}
                <div className="flex items-start gap-4 p-5 bg-slate-50/80 rounded-xl border border-slate-200/60">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                    {post.author?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      Written by {post.author}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Sanjit Mishra is the founder and certified lead electrician at VoltixNepal with over 10 years of experience providing reliable electrical wiring, diagnostics, and emergency repair across Kathmandu Valley.
                    </p>
                  </div>
                </div>

                {/* Direct Action CTA */}
                <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="font-bold text-base text-white mb-1">
                      Need emergency or planned electrical work?
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Book an inspection or talk directly with Sanjit Mishra.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 shrink-0 w-full sm:w-auto">
                    <a
                      href={`tel:${businessPhone.replace(/\s+/g, '')}`}
                      className="px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors text-center flex-1 sm:flex-none"
                    >
                      Call {businessPhone}
                    </a>
                    <Link
                      href="/request-service"
                      className="px-4 py-2.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center flex-1 sm:flex-none shadow-xs"
                    >
                      Book Service
                    </Link>
                  </div>
                </div>
              </div>

            </article>

            {/* Right Column: Sidebar (Search, Newsletter, Recent Posts) */}
            <BlogSidebar recentPosts={recentPosts} />

          </div>

        </div>

      </main>
    </div>
  );
}
