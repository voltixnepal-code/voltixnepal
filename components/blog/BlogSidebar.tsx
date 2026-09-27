'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Mail, CheckCircle2 } from 'lucide-react';

interface RecentPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  featuredImage: string;
  publishedAt: string | Date;
}

interface BlogSidebarProps {
  recentPosts: RecentPost[];
}

export default function BlogSidebar({ recentPosts }: BlogSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subMessage, setSubMessage] = useState('');
  const router = useRouter();


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setSubMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
        setSubMessage(data.message || 'Check your inbox for your welcome email!');
        setEmail('');
        setTimeout(() => setSubscribed(false), 6000);
      } else {
        alert(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <aside className="w-full lg:w-[340px] shrink-0 space-y-8">
      {/* Search Widget */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Search
        </h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Newsletter Widget */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Newsletter
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Get the latest electrical safety tips, energy-saving guides, and service updates straight to your inbox.
        </p>

        {subscribed ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Thank you for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>

      {/* Recent Posts Widget */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Recent Posts
          </h3>
          <div className="space-y-4">
            {recentPosts.map((post) => {
              const postDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-3 items-start"
                >
                  <div className="relative w-16 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-100">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold text-red-600 uppercase tracking-wide leading-none mb-1">
                      {post.category}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {postDate}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
