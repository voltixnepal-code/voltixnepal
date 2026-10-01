/**
 * VoltixNepal Universal Media & Embed Resolution Utility
 * Supports ANY video, photo, social media, or website link:
 * - YouTube (Videos, Shorts, Embeds, youtu.be)
 * - Facebook (Videos, Reels, Watch, Posts)
 * - Instagram (Reels, Posts, IGTV)
 * - TikTok (Videos, Shortlinks)
 * - Vimeo (Videos, Player links)
 * - Google Drive (Shared files & video previews)
 * - Twitter / X (Status links)
 * - Cloudflare R2 & Cloudinary CDN
 * - Direct MP4, WebM, MOV, OGG, M4V, HLS videos
 * - Direct JPG, PNG, WebP, GIF, SVG, AVIF, HEIC photos
 * - Any website URL or pasted <iframe> embed snippet
 */

export type MediaPlatform =
  | 'YOUTUBE'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'VIMEO'
  | 'GOOGLE_DRIVE'
  | 'TWITTER'
  | 'CLOUDINARY'
  | 'CLOUDFLARE_R2'
  | 'DIRECT_VIDEO'
  | 'DIRECT_IMAGE'
  | 'EXTERNAL';

export interface ParsedMedia {
  cleanUrl: string;
  provider: MediaPlatform;
  providerLabel: string;
  mediaType: 'PHOTO' | 'VIDEO';
  embedUrl: string | null;
  thumbnailUrl: string | null;
  requiresIframe: boolean;
  canDirectEmbed: boolean;
  platformColor: string;
  platformIconName: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'vimeo' | 'drive' | 'cloud' | 'video' | 'image' | 'globe';
}

/**
 * Clean and extract a usable URL from user input
 * Handles raw URLs and pasted <iframe src="..."> code snippets
 */
export function extractUrlFromInput(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If user pasted an iframe tag, extract the src attribute
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }

  // If user pasted a markdown link [text](url)
  const markdownMatch = trimmed.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1].trim();
  }

  // Fix protocol if missing but domain is obvious
  if (/^(www\.|youtu\.be|vimeo\.com|tiktok\.com|instagram\.com|facebook\.com)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Parse any media link to identify platform, embed URL, thumbnail, and media type
 */
export function parseMediaUrl(input: string, fallbackMediaType: 'PHOTO' | 'VIDEO' = 'PHOTO'): ParsedMedia {
  const cleanUrl = extractUrlFromInput(input);
  if (!cleanUrl) {
    return {
      cleanUrl: '',
      provider: 'EXTERNAL',
      providerLabel: 'External Media',
      mediaType: fallbackMediaType,
      embedUrl: null,
      thumbnailUrl: null,
      requiresIframe: false,
      canDirectEmbed: false,
      platformColor: 'bg-slate-700',
      platformIconName: fallbackMediaType === 'VIDEO' ? 'video' : 'image',
    };
  }

  // 1. YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID, m.youtube.com
  const youtubeMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i
  );
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      cleanUrl,
      provider: 'YOUTUBE',
      providerLabel: 'YouTube Video',
      mediaType: 'VIDEO',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      requiresIframe: true,
      canDirectEmbed: true,
      platformColor: 'bg-red-600',
      platformIconName: 'youtube',
    };
  }

  // 2. Vimeo
  const vimeoMatch = cleanUrl.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i
  );
  const vimeoId = vimeoMatch ? vimeoMatch[1] || vimeoMatch[2] : null;
  if (vimeoId) {
    return {
      cleanUrl,
      provider: 'VIMEO',
      providerLabel: 'Vimeo Video',
      mediaType: 'VIDEO',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=dc2626`,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
      requiresIframe: true,
      canDirectEmbed: true,
      platformColor: 'bg-sky-500',
      platformIconName: 'vimeo',
    };
  }

  // 3. Instagram (Reels & Posts)
  const instagramMatch = cleanUrl.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
  if (instagramMatch) {
    const postType = instagramMatch[1].toLowerCase();
    const shortcode = instagramMatch[2];
    const isVideo = postType === 'reel' || postType === 'tv' || fallbackMediaType === 'VIDEO';
    return {
      cleanUrl,
      provider: 'INSTAGRAM',
      providerLabel: postType === 'reel' ? 'Instagram Reel' : 'Instagram Post',
      mediaType: isVideo ? 'VIDEO' : 'PHOTO',
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
      thumbnailUrl: null,
      requiresIframe: true,
      canDirectEmbed: true,
      platformColor: 'bg-gradient-to-r from-purple-600 to-pink-500',
      platformIconName: 'instagram',
    };
  }

  // 4. Facebook (Videos, Reels, Watch, Posts)
  if (/facebook\.com|fb\.watch/i.test(cleanUrl)) {
    const isReelOrVideo = /video|watch|reel|fb\.watch/i.test(cleanUrl) || fallbackMediaType === 'VIDEO';
    const embedBase = isReelOrVideo
      ? 'https://www.facebook.com/plugins/video.php'
      : 'https://www.facebook.com/plugins/post.php';
    const embedUrl = `${embedBase}?href=${encodeURIComponent(cleanUrl)}&show_text=false&autoplay=true`;

    return {
      cleanUrl,
      provider: 'FACEBOOK',
      providerLabel: isReelOrVideo ? 'Facebook Video' : 'Facebook Post',
      mediaType: isReelOrVideo ? 'VIDEO' : 'PHOTO',
      embedUrl,
      thumbnailUrl: null,
      requiresIframe: true,
      canDirectEmbed: true,
      platformColor: 'bg-blue-600',
      platformIconName: 'facebook',
    };
  }

  // 5. TikTok
  const tiktokMatch = cleanUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (tiktokMatch || /tiktok\.com/i.test(cleanUrl)) {
    const videoId = tiktokMatch ? tiktokMatch[1] : '';
    const embedUrl = videoId
      ? `https://www.tiktok.com/embed/v2/${videoId}`
      : `https://www.tiktok.com/embed?url=${encodeURIComponent(cleanUrl)}`;

    return {
      cleanUrl,
      provider: 'TIKTOK',
      providerLabel: 'TikTok Video',
      mediaType: 'VIDEO',
      embedUrl,
      thumbnailUrl: null,
      requiresIframe: true,
      canDirectEmbed: true,
      platformColor: 'bg-black',
      platformIconName: 'tiktok',
    };
  }

  // 6. Google Drive
  const driveMatch = cleanUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      cleanUrl,
      provider: 'GOOGLE_DRIVE',
      providerLabel: 'Google Drive Media',
      mediaType: fallbackMediaType || 'VIDEO',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
      requiresIframe: true,
      canDirectEmbed: true,
      platformColor: 'bg-amber-600',
      platformIconName: 'drive',
    };
  }

  // 7. Twitter / X
  if (/twitter\.com|x\.com/i.test(cleanUrl)) {
    return {
      cleanUrl,
      provider: 'TWITTER',
      providerLabel: 'X / Twitter Post',
      mediaType: fallbackMediaType || 'VIDEO',
      embedUrl: `https://platform.twitter.com/embed/Tweet.html?dnt=true&embedHost=voltixnepal&url=${encodeURIComponent(cleanUrl)}`,
      thumbnailUrl: null,
      requiresIframe: true,
      canDirectEmbed: true,
      platformColor: 'bg-neutral-900',
      platformIconName: 'globe',
    };
  }

  // 8. Cloudflare R2
  if (/r2\.cloudflarestorage\.com|r2\.voltixnepal\.com|\.r2\.dev/i.test(cleanUrl)) {
    const isVid = /\.(mp4|webm|mov|m4v|ogg|m3u8)(\?|$)/i.test(cleanUrl) || fallbackMediaType === 'VIDEO';
    return {
      cleanUrl,
      provider: 'CLOUDFLARE_R2',
      providerLabel: isVid ? 'Cloudflare R2 Video' : 'Cloudflare R2 Asset',
      mediaType: isVid ? 'VIDEO' : 'PHOTO',
      embedUrl: null,
      thumbnailUrl: null,
      requiresIframe: false,
      canDirectEmbed: true,
      platformColor: 'bg-amber-600',
      platformIconName: isVid ? 'video' : 'image',
    };
  }

  // 9. Cloudinary
  if (/res\.cloudinary\.com/i.test(cleanUrl)) {
    const isVid = /\/video\/upload\//i.test(cleanUrl) || /\.(mp4|webm|mov)(\?|$)/i.test(cleanUrl) || fallbackMediaType === 'VIDEO';
    return {
      cleanUrl,
      provider: 'CLOUDINARY',
      providerLabel: isVid ? 'Cloudinary Video' : 'Cloudinary Photo',
      mediaType: isVid ? 'VIDEO' : 'PHOTO',
      embedUrl: null,
      thumbnailUrl: isVid ? null : cleanUrl,
      requiresIframe: false,
      canDirectEmbed: true,
      platformColor: 'bg-blue-600',
      platformIconName: isVid ? 'video' : 'image',
    };
  }

  // 10. Direct Video Files (.mp4, .webm, .mov, .ogg, .m4v, .m3u8)
  if (/\.(mp4|webm|mov|ogg|m4v|m3u8)(\?.*)?$/i.test(cleanUrl) || /googlevideo\.com|gtv-videos-bucket/i.test(cleanUrl)) {
    return {
      cleanUrl,
      provider: 'DIRECT_VIDEO',
      providerLabel: 'Direct HD Video',
      mediaType: 'VIDEO',
      embedUrl: null,
      thumbnailUrl: null,
      requiresIframe: false,
      canDirectEmbed: true,
      platformColor: 'bg-emerald-600',
      platformIconName: 'video',
    };
  }

  // 11. Direct Image Files (.jpg, .jpeg, .png, .webp, .gif, .svg, .avif, .bmp, unsplash, imgur, etc.)
  if (
    /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|heic)(\?.*)?$/i.test(cleanUrl) ||
    /images\.unsplash\.com|imgur\.com|postimg\.cc|pinimg\.com|googleusercontent\.com/i.test(cleanUrl)
  ) {
    return {
      cleanUrl,
      provider: 'DIRECT_IMAGE',
      providerLabel: 'Direct Web Photo',
      mediaType: 'PHOTO',
      embedUrl: null,
      thumbnailUrl: cleanUrl,
      requiresIframe: false,
      canDirectEmbed: true,
      platformColor: 'bg-blue-600',
      platformIconName: 'image',
    };
  }

  // 12. Fallback: Any other Web Link / URL
  const isFallbackVideo = fallbackMediaType === 'VIDEO';
  return {
    cleanUrl,
    provider: 'EXTERNAL',
    providerLabel: isFallbackVideo ? 'External Video / Webpage' : 'External Photo / Webpage',
    mediaType: isFallbackVideo ? 'VIDEO' : 'PHOTO',
    embedUrl: cleanUrl,
    thumbnailUrl: null,
    requiresIframe: isFallbackVideo,
    canDirectEmbed: true,
    platformColor: 'bg-slate-700',
    platformIconName: 'globe',
  };
}
