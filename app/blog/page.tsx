import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

import { DEFAULT_BLOG_POSTS } from '@/lib/default-data';

export const metadata: Metadata = {
  title: 'Electrical Safety & Maintenance Guides | VoltixNepal',
  description:
    'Practical electrical guides, monsoon troubleshooting, inverter sizing, and wiring safety tips for homeowners in Nepal.',
};

export const revalidate = 0;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  let posts = DEFAULT_BLOG_POSTS as any[];
  let allPosts = DEFAULT_BLOG_POSTS as any[];

  try {
    const whereClause: any = { isPublished: true };
    if (searchParams.category && searchParams.category !== 'ALL') {
      whereClause.category = searchParams.category;
    }
    if (searchParams.q) {
      whereClause.OR = [
        { title: { contains: searchParams.q } },
        { summary: { contains: searchParams.q } },
      ];
    }

    const [dbPosts, dbAllPosts] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereClause,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { category: true },
      }),
    ]);

    if (dbPosts && dbPosts.length > 0) posts = dbPosts;
    if (dbAllPosts && dbAllPosts.length > 0) allPosts = dbAllPosts;
  } catch (err) {
    console.warn('Using default blog posts:', err);
  }

  const categories = ['ALL', ...Array.from(new Set(allPosts.map((p) => p.category)))];

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Safety Guides & Electrical Tips
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Practical advice written by Sanjit Mishra to help you maintain safe wiring and make informed decisions on home power systems.
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => {
            const isSelected =
              (searchParams.category || 'ALL') === cat;
            return (
              <Link
                key={cat}
                href={cat === 'ALL' ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Blog Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500 text-sm">
            No articles found in this category. Check back soon for new guides!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const dateStr = new Date(post.publishedAt).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              );

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-red-600 text-white text-xs font-semibold">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {post.author}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
