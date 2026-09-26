'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, User } from 'lucide-react';

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  featuredImage: string;
  category: string;
  author: string;
  publishedAt: string | Date;
}

interface BlogSnippetProps {
  posts: BlogPostItem[];
}

export default function BlogSnippet({ posts }: BlogSnippetProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isTouched = false;

    const onTouchStart = () => {
      isTouched = true;
    };
    const onTouchEnd = () => {
      setTimeout(() => {
        isTouched = false;
      }, 3000);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    const interval = setInterval(() => {
      if (window.innerWidth >= 768 || isTouched) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const itemWidth = el.firstElementChild?.clientWidth || 280;
        el.scrollBy({ left: itemWidth + 16, behavior: 'smooth' });
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-white border-t border-slate-200 w-full overflow-hidden" id="blog">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Electrical Tips & Guides
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-4 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {posts.slice(0, 6).map((post) => {
            const dateStr = new Date(post.publishedAt).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric', year: 'numeric' }
            );

            return (
              <article
                key={post.id}
                className="w-[85vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 85vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-red-600 text-white text-[11px] font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-red-600 transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 group-hover:underline"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
