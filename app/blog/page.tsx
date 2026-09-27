import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Search, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import { DEFAULT_BLOG_POSTS } from '@/lib/default-data';

export const metadata: Metadata = {
  title: 'Blog | VoltixNepal',
  description:
    'Electrical safety guides, monsoon wiring tips, inverter sizing, and maintenance advice for homeowners in Nepal.',
};

export const revalidate = 0;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  let posts = DEFAULT_BLOG_POSTS as any[];
  let allPosts = DEFAULT_BLOG_POSTS as any[];

  const categoryFilter = searchParams.category;
  const searchQuery = searchParams.q?.toLowerCase().trim();

  try {
    const whereClause: any = { isPublished: true };
    if (categoryFilter && categoryFilter !== 'ALL') {
      whereClause.category = categoryFilter;
    }
    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { summary: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const [dbPosts, dbAll] = await Promise.all([
      prisma.blogPost.findMany({ where: whereClause, orderBy: { publishedAt: 'desc' } }),
      prisma.blogPost.findMany({ where: { isPublished: true }, select: { category: true } }),
    ]);
    if (dbPosts) posts = dbPosts;
    if (dbAll && dbAll.length > 0) allPosts = dbAll;
  } catch {
    // fallback to filtering default static data if DB unavailable
    if (categoryFilter && categoryFilter !== 'ALL') {
      posts = posts.filter((p) => p.category === categoryFilter);
    }
    if (searchQuery) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery) ||
          p.summary?.toLowerCase().includes(searchQuery) ||
          p.content?.toLowerCase().includes(searchQuery)
      );
    }
  }

  const categories = ['ALL', ...Array.from(new Set(allPosts.map((p: any) => p.category)))];
  const activeCategory = categoryFilter || 'ALL';

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 relative overflow-hidden">
      <div className="absolute top-10 left-[-100px] w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-10 relative z-10">
        
        {/* Main white container card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-xs">
          
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-red-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </li>
              <li className="text-slate-800 font-medium">Blog</li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-8 border-b border-slate-200/80 pb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Electrical Safety & Engineering Blog
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-normal max-w-2xl">
              Practical guides, circuit troubleshooting advice, inverter calculation formulas, and safety standards for homes and businesses across Nepal.
            </p>
          </div>

          {/* Category Filter & Search query banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <Link
                    key={cat}
                    href={cat === 'ALL' ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>

            {searchQuery && (
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Search results for &ldquo;<strong className="text-slate-800">{searchQuery}</strong>&rdquo;</span>
                <Link href="/blog" className="text-red-600 hover:underline">Clear</Link>
              </div>
            )}
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">No articles found.</p>
              <p className="text-slate-400 text-xs mt-1">Try searching for different keywords or select another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post: any) => {
                const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const readingTime = Math.max(1, Math.ceil((post.content?.split(' ').length || 0) / 200));
                return (
                  <article key={post.id} className="group flex flex-col bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition-all">
                    {/* Thumbnail */}
                    <Link href={`/blog/${post.slug}`} className="block relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Content padding */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Meta line */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                        <span className="font-bold text-red-600 uppercase tracking-wide">{post.category}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{readingTime} min read</span>
                      </div>

                      {/* Title */}
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug mb-2 line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      {/* Summary */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1 mb-4">
                        {post.summary}
                      </p>

                      {/* Read more */}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-red-600 transition-colors mt-auto pt-3 border-t border-slate-100"
                      >
                        Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
