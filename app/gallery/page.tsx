import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'Daily Work Gallery & Video Showcase | VoltixNepal',
  description:
    'Browse daily on-site electrical work photos and videos across Kathmandu Valley by electrician Sanjit Mishra. Complete house wiring, MCB troubleshooting, inverter installations, and earthing pits.',
  keywords: [
    'electrician work gallery kathmandu',
    'house wiring photos nepal',
    'electrical repair video nepal',
    'inverter installation photos kathmandu',
    'voltix nepal daily work',
    'sanjit mishra gallery',
  ],
  openGraph: {
    title: 'Daily Electrical Work Gallery & Video Showcase | VoltixNepal',
    description:
      'Verified daily electrical contracting photos & videos in Kathmandu, Lalitpur, and Bhaktapur. See real project demonstrations.',
    url: 'https://voltixnepal.com/gallery',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'VoltixNepal Electrical Work Gallery',
      },
    ],
  },
};

export default async function GalleryPage() {
  let items: any[] = [];
  try {
    const galleryDelegate = (prisma as any).galleryItem;
    if (galleryDelegate) {
      items = await galleryDelegate.findMany({
        where: { isPublished: true },
        orderBy: [
          { sortOrder: 'asc' },
          { dateTaken: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    }
  } catch (err) {
    console.error('Failed to fetch gallery items:', err);
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
        {/* Header Hero */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-12 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Daily Electrical Work <span className="text-red-600">Gallery & Videos</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Real photos and HD demonstration videos from recent residential wiring, emergency short circuit repairs, inverter battery backups, and distribution board installations across Kathmandu Valley by Sanjit Mishra.
          </p>
        </div>

        {/* Client Interactive Filter & Grid */}
        <GalleryClient initialItems={items} />
      </div>
    </div>
  );
}
