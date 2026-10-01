'use client';

import React, { useState } from 'react';
import {
  Play,
  Video,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Eye,
  Film,
  Sparkles,
  Globe,
  Maximize2
} from 'lucide-react';
import { parseMediaUrl, ParsedMedia } from '@/lib/media-embed';

interface MediaRendererProps {
  mediaUrl: string;
  thumbnailUrl?: string | null;
  mediaType: 'PHOTO' | 'VIDEO';
  storageProvider?: string;
  title?: string;
  className?: string;
  mode?: 'thumbnail' | 'player' | 'preview';
  autoPlay?: boolean;
  onPlayClick?: () => void;
}

export function MediaRenderer({
  mediaUrl,
  thumbnailUrl,
  mediaType,
  storageProvider,
  title = 'Media',
  className = '',
  mode = 'thumbnail',
  autoPlay = false,
  onPlayClick,
}: MediaRendererProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const parsed = parseMediaUrl(mediaUrl, mediaType);
  const effectiveThumbnail =
    thumbnailUrl ||
    parsed.thumbnailUrl ||
    (parsed.mediaType === 'PHOTO' && !parsed.requiresIframe ? parsed.cleanUrl : null);

  // Platform badge helper
  const renderPlatformBadge = () => {
    let label = parsed.providerLabel;
    if (storageProvider === 'CLOUDFLARE_R2') label = 'Cloudflare R2';
    if (storageProvider === 'CLOUDINARY') label = 'Cloudinary';

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${parsed.platformColor}`}
      >
        {parsed.mediaType === 'VIDEO' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
        <span>{label}</span>
      </span>
    );
  };

  // MODE 1: Thumbnail for cards in Gallery & Admin list
  if (mode === 'thumbnail') {
    const isVideo = parsed.mediaType === 'VIDEO';

    return (
      <div className={`relative w-full h-full bg-slate-900 overflow-hidden ${className}`}>
        {effectiveThumbnail && !imageError ? (
          <img
            src={effectiveThumbnail}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : isVideo && !parsed.requiresIframe && !videoError ? (
          <video
            src={parsed.cleanUrl}
            preload="metadata"
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-950 text-white text-center">
            {isVideo ? (
              <Film className="w-8 h-8 text-amber-400 mb-1.5 opacity-80" />
            ) : (
              <ImageIcon className="w-8 h-8 text-blue-400 mb-1.5 opacity-80" />
            )}
            <span className="text-[11px] font-bold text-slate-200 line-clamp-1">{parsed.providerLabel}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Click to view media</span>
          </div>
        )}

        {/* Video Overlay Play Button */}
        {isVideo && (
          <div
            onClick={onPlayClick}
            className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-200">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Badge in top corner */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none">
          {renderPlatformBadge()}
        </div>
      </div>
    );
  }

  // MODE 2 & 3: Full interactive Player / Modal viewer / Admin Preview
  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
      {/* 1. Iframe Embed for YouTube, Vimeo, Facebook, Instagram, TikTok, Google Drive, etc. */}
      {parsed.requiresIframe && parsed.embedUrl ? (
        <div className="w-full aspect-video min-h-[280px] sm:min-h-[380px] max-h-[550px] relative bg-black">
          <iframe
            src={parsed.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 absolute inset-0"
          />
        </div>
      ) : parsed.mediaType === 'VIDEO' ? (
        /* 2. Direct HTML5 Video Player (MP4, WebM, Cloudflare R2, Cloudinary video) */
        <video
          src={parsed.cleanUrl}
          poster={effectiveThumbnail || undefined}
          controls
          autoPlay={autoPlay}
          playsInline
          className="w-full max-h-[550px] object-contain bg-black"
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        /* 3. High Definition Image Viewer */
        <div className="w-full max-h-[550px] flex items-center justify-center bg-black/90 p-1">
          <img
            src={parsed.cleanUrl}
            alt={title}
            className="max-w-full max-h-[520px] object-contain rounded"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Platform indicator badge component for cards & modals
 */
export function MediaPlatformBadge({
  mediaUrl,
  fallbackMediaType = 'PHOTO',
  customProvider,
}: {
  mediaUrl: string;
  fallbackMediaType?: 'PHOTO' | 'VIDEO';
  customProvider?: string;
}) {
  const parsed = parseMediaUrl(mediaUrl, fallbackMediaType);
  let label = parsed.providerLabel;
  if (customProvider === 'CLOUDFLARE_R2') label = 'Cloudflare R2';
  if (customProvider === 'CLOUDINARY') label = 'Cloudinary';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold text-white shadow-xs ${parsed.platformColor}`}
    >
      {parsed.mediaType === 'VIDEO' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </span>
  );
}
