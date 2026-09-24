'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Video,
  Play,
  MapPin,
  Calendar,
  Layers,
  Phone,
  MessageSquare,
  ExternalLink,
  X,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  mediaType: 'PHOTO' | 'VIDEO';
  storageProvider: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  fileSizeBytes: number | null;
  category: string;
  location: string | null;
  dateTaken: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

const CATEGORIES = [
  'All Categories',
  'House Wiring',
  'Emergency Repair',
  'Inverter & Battery',
  'Distribution Board',
  'Lighting & Fixtures',
  'Earthing Pit',
  'Commercial Automation',
];

export default function GalleryClient({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items] = useState<GalleryItem[]>(initialItems);
  const [filterType, setFilterType] = useState<'ALL' | 'PHOTO' | 'VIDEO'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox / Video Modal State
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'ALL' || item.mediaType === filterType;
    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Media Type Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Works ({items.length})
            </button>
            <button
              onClick={() => setFilterType('PHOTO')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                filterType === 'PHOTO'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({items.filter((i) => i.mediaType === 'PHOTO').length})</span>
            </button>
            <button
              onClick={() => setFilterType('VIDEO')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                filterType === 'VIDEO'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({items.filter((i) => i.mediaType === 'VIDEO').length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search work, location, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Work Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">No Projects Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No daily work photos or videos match your selected category or filter.
          </p>
          <button
            onClick={() => {
              setFilterType('ALL');
              setSelectedCategory('All Categories');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isVideo = item.mediaType === 'VIDEO';

            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  {isVideo ? (
                    <>
                      <video
                        src={item.mediaUrl}
                        poster={item.thumbnailUrl || undefined}
                        preload="metadata"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-200">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Top Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-md ${
                        isVideo ? 'bg-red-600' : 'bg-slate-900/80 backdrop-blur-xs'
                      }`}
                    >
                      {isVideo ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      <span>{item.category}</span>
                    </span>
                  </div>

                  {/* Video HD Tag */}
                  {isVideo && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400">
                      HD Video (R2)
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
                      {item.title}
                    </h2>

                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Location, Date & CTA Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                      {item.location && (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="truncate max-w-[120px]">{item.location}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(item.dateTaken).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </span>
                    </div>

                    <span className="text-xs font-bold text-red-600 inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Video Modal Popup (Completely Transparent without dark overlays) */}
      {activeItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveItem(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center bg-transparent pointer-events-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-300 ring-1 ring-black/10 max-w-3xl w-full overflow-hidden shadow-2xl space-y-0 my-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{activeItem.category}</span>
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeItem.location || 'Kathmandu Valley'}</span>
                </span>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player / Image Viewer */}
            <div className="bg-black aspect-video max-h-[480px] flex items-center justify-center relative">
              {activeItem.mediaType === 'VIDEO' ? (
                <video
                  src={activeItem.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[480px] object-contain"
                />
              ) : (
                <img
                  src={activeItem.mediaUrl}
                  alt={activeItem.title}
                  className="w-full h-full max-h-[480px] object-contain"
                />
              )}
            </div>

            {/* Modal Content Details */}
            <div className="p-5 sm:p-6 space-y-4 bg-white">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {activeItem.title}
                </h2>
                {activeItem.description && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {activeItem.description}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">
                    Executed by Sanjit Mishra (VoltixNepal)
                  </span>
                </div>

                <div className="text-slate-500">
                  Date: {new Date(activeItem.dateTaken).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/request-service?service=${encodeURIComponent(activeItem.category)}`}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Request Similar Electrical Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/9779825870047?text=${encodeURIComponent(
                    `Hello Sanjit, I saw your work "${activeItem.title}" on the VoltixNepal Gallery and would like to inquire about similar electrical work.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Inquire on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
