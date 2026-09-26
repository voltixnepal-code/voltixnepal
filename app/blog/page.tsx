import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
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
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="bg-white min-h-screen w-full">

      {/* Page Header */}
      <div className="w-full bg-slate-900 py-12 sm:py-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-2">VoltixNepal</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Electrical Safety Guides
          </h1>
          <p className="text-slate-400 text-base mt-3 max-w-2xl">
            Practical advice from Sanjit Mishra to help you maintain safe wiring and make smart decisions about your home power systems.
          </p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-16 py-10 lg:py-14 max-w-7xl mx-auto">

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {categories.map((cat) => {
            const isSelected = (searchParams.category || 'ALL') === cat;
            return (
              <Link
                key={cat}
                href={cat === 'ALL' ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-red-400 hover:text-red-600'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {posts.length === 0 ? (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-16 text-center text-slate-500 text-sm">
            No articles found in this category. Check back soon!
          </div>
        ) : (
          <>
            {/* Featured / Hero Post */}
            {featured && !searchParams.category && !searchParams.q && (
              <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative h-64 sm:h-80 lg:h-full min-h-[300px] bg-slate-100 overflow-hidden">
                    <Image
                      src={featured.featuredImage}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
                    <span className="text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
                      {featured.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors leading-tight mb-3">
                      {featured.title}
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                      {featured.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {featured.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.max(1, Math.ceil(featured.content?.split(' ').length / 200))} min read
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-bold text-red-600 group-hover:gap-3 transition-all">
                      Read Full Guide <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of remaining posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {(searchParams.category || searchParams.q ? posts : rest).map((post: any) => {
                const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const readingTime = Math.max(1, Math.ceil(post.content?.split(' ').length / 200));

                return (
                  <article
                    key={post.id}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {readingTime} min read
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                        {post.summary}
                      </p>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {post.author?.charAt(0) || 'S'}
                          </div>
                          {post.author}
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:gap-2 transition-all"
                        >
                          Read <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
