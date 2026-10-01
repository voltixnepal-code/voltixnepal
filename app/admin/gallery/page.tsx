'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Upload,
  Trash2,
  Edit2,
  ExternalLink,
  MapPin,
  Calendar,
  Cloud,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Film,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { MediaRenderer, MediaPlatformBadge } from '@/components/gallery/MediaRenderer';
import { parseMediaUrl, extractUrlFromInput } from '@/lib/media-embed';

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
  'House Wiring',
  'Emergency Repair',
  'Inverter & Battery',
  'Distribution Board',
  'Lighting & Fixtures',
  'Earthing Pit',
  'Commercial Automation',
  'Appliance Installation',
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'PHOTO' | 'VIDEO'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'PHOTO' | 'VIDEO'>('PHOTO');
  const [storageProvider, setStorageProvider] = useState<string>('CLOUDINARY');
  const [sourceCategory, setSourceCategory] = useState<'PHOTO' | 'VIDEO' | 'EMBED'>('PHOTO');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('House Wiring');
  const [location, setLocation] = useState('Kathmandu Valley');
  const [dateTaken, setDateTaken] = useState(new Date().toISOString().split('T')[0]);
  const [isPublished, setIsPublished] = useState(true);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gallery?all=true');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setMediaType('PHOTO');
    setStorageProvider('CLOUDINARY');
    setSourceCategory('PHOTO');
    setMediaUrl('');
    setThumbnailUrl('');
    setCategory('House Wiring');
    setLocation('Kathmandu Valley');
    setDateTaken(new Date().toISOString().split('T')[0]);
    setIsPublished(true);
    setFileSizeBytes(null);
    setError(null);
    setUploadProgress(null);
    setShowModal(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setMediaType(item.mediaType);
    setStorageProvider(item.storageProvider);
    const parsed = parseMediaUrl(item.mediaUrl, item.mediaType);
    if (parsed.requiresIframe || (parsed.provider !== 'CLOUDINARY' && parsed.provider !== 'CLOUDFLARE_R2')) {
      setSourceCategory('EMBED');
    } else if (item.mediaType === 'VIDEO') {
      setSourceCategory('VIDEO');
    } else {
      setSourceCategory('PHOTO');
    }
    setMediaUrl(item.mediaUrl);
    setThumbnailUrl(item.thumbnailUrl || '');
    setCategory(item.category);
    setLocation(item.location || 'Kathmandu Valley');
    setDateTaken(item.dateTaken ? new Date(item.dateTaken).toISOString().split('T')[0] : '');
    setIsPublished(item.isPublished);
    setFileSizeBytes(item.fileSizeBytes);
    setError(null);
    setUploadProgress(null);
    setShowModal(true);
  };

  const handleSourceTabChange = (tab: 'PHOTO' | 'VIDEO' | 'EMBED') => {
    setSourceCategory(tab);
    if (tab === 'PHOTO') {
      setMediaType('PHOTO');
      if (storageProvider === 'CLOUDFLARE_R2') setStorageProvider('CLOUDINARY');
    } else if (tab === 'VIDEO') {
      setMediaType('VIDEO');
      if (storageProvider === 'CLOUDINARY') setStorageProvider('CLOUDFLARE_R2');
    } else {
      // Embed / Social tab
      setStorageProvider('EXTERNAL');
    }
  };

  const handleMediaUrlChange = (val: string) => {
    setMediaUrl(val);
    const cleaned = extractUrlFromInput(val);
    if (!cleaned) return;

    const parsed = parseMediaUrl(cleaned, mediaType);
    if (parsed.embedUrl || parsed.provider !== 'EXTERNAL') {
      setMediaType(parsed.mediaType);
      setStorageProvider(parsed.provider);
      if (parsed.requiresIframe || (parsed.provider !== 'CLOUDINARY' && parsed.provider !== 'CLOUDFLARE_R2')) {
        setSourceCategory('EMBED');
      }
      if (parsed.thumbnailUrl && (!thumbnailUrl || thumbnailUrl.includes('youtube.com') || thumbnailUrl.includes('vumbnail.com'))) {
        setThumbnailUrl(parsed.thumbnailUrl);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadProgress(10);

    const isVideo = file.type.startsWith('video/') || mediaType === 'VIDEO';
    const targetMediaType = isVideo ? 'VIDEO' : 'PHOTO';
    const targetStorage = isVideo ? 'CLOUDFLARE_R2' : 'CLOUDINARY';

    // File limit checks
    const MAX_IMAGE_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      setError(`Video exceeds the maximum 500MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      setUploadProgress(null);
      return;
    }

    if (!isVideo && file.size > MAX_IMAGE_SIZE) {
      setError(`Photo exceeds the maximum 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      setUploadProgress(null);
      return;
    }

    try {
      setMediaType(targetMediaType);
      setStorageProvider(targetStorage);
      setFileSizeBytes(file.size);

      // Default title if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }

      if (isVideo) {
        // Step A: Request pre-signed URL or direct R2 upload
        setUploadProgress(30);
        const presignRes = await adminFetch('/api/upload/r2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || 'video/mp4',
            fileSize: file.size,
          }),
        });
        const presignData = presignRes.data || {};

        if (presignData.success && presignData.uploadUrl) {
          // Direct Upload to Cloudflare R2 via Presigned PUT
          setUploadProgress(50);
          const uploadRes = await fetch(presignData.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'video/mp4' },
            body: file,
          });

          if (!uploadRes.ok) {
            throw new Error('Failed to upload video stream to Cloudflare R2.');
          }

          setMediaUrl(presignData.fileUrl);
          setUploadProgress(100);
        } else {
          // Fallback to direct multipart R2 upload
          const formData = new FormData();
          formData.append('file', file);
          const directRes = await adminFetch('/api/upload/r2', {
            method: 'POST',
            body: formData,
          });
          const directData = directRes.data || {};
          if (!directRes.ok || !directData.success) {
            throw new Error(directRes.error || directData.message || 'R2 upload failed.');
          }
          setMediaUrl(directData.url);
          setUploadProgress(100);
        }
      } else {
        // Photo upload to Cloudinary (up to 100MB)
        setUploadProgress(40);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'voltixnepal/daily-work');

        const uploadRes = await adminFetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = uploadRes.data || {};

        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadRes.error || uploadData.error || 'Failed to upload photo to Cloudinary.');
        }

        const url = uploadData.secure_url || uploadData.url;
        setMediaUrl(url);
        setThumbnailUrl(url);
        setUploadProgress(100);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'File upload failed. You can also paste a direct URL.');
    } finally {
      setTimeout(() => setUploadProgress(null), 1500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) {
      setError('Title and Media URL are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      description,
      mediaType,
      storageProvider,
      mediaUrl,
      thumbnailUrl: thumbnailUrl || (mediaType === 'PHOTO' ? mediaUrl : null),
      fileSizeBytes,
      category,
      location,
      dateTaken,
      isPublished,
      sortOrder: editingItem ? editingItem.sortOrder : 0,
    };

    try {
      const url = editingItem ? `/api/gallery/${editingItem.id}` : '/api/gallery';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = res.data || {};
      if (!res.ok || !data.success) {
        throw new Error(res.error || data.message || 'Failed to save gallery item.');
      }

      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to save item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"?`)) return;

    try {
      const res = await adminFetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = res.data || {};
      if (res.ok && data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(res.error || data.message || 'Failed to delete item.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting gallery item.');
    }
  };

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      const res = await adminFetch(`/api/gallery/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      const data = res.data || {};
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i))
        );
      }
    } catch (err) {
      console.error('Toggle publish error:', err);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'ALL' || item.mediaType === filterType;
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              Daily Work Gallery & Video Showcase
            </h1>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
              {items.length} Works
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload on-site photos (Cloudinary &lt;100MB), HD videos (Cloudflare R2 &lt;500MB), or embed ANY video/photo link (YouTube, Facebook, Instagram Reels, TikTok, Vimeo, Google Drive, and any web URL).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Gallery</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work Photo / Video / Link</span>
          </button>
        </div>
      </div>

      {/* Storage & Universal Media Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 p-4 rounded-xl border border-blue-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <span>Cloudinary CDN</span>
              <span className="bg-blue-200/80 text-blue-800 text-[10px] px-1.5 py-0.2 rounded font-mono">&lt;100MB</span>
            </h2>
            <p className="text-[11px] text-blue-800/80 mt-0.5 leading-relaxed">
              Auto-responsive WebP compression and instant thumbnails for site electrical wiring photos.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>Cloudflare R2 HD</span>
              <span className="bg-amber-200/80 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono">&lt;500MB</span>
            </h2>
            <p className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed">
              Zero-egress fast direct streaming for large diagnostic and panel wiring videos.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-50 to-red-50/40 p-4 rounded-xl border border-rose-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <span>Universal Social & Web Embed</span>
              <span className="bg-rose-200/80 text-rose-800 text-[10px] px-1.5 py-0.2 rounded font-mono">Any Link</span>
            </h2>
            <p className="text-[11px] text-rose-800/80 mt-0.5 leading-relaxed">
              Paste YouTube, Facebook, Instagram Reels, TikTok, Vimeo, Drive, or any website video/photo link.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Media ({items.length})
            </button>
            <button
              onClick={() => setFilterType('PHOTO')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'PHOTO' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({items.filter((i) => i.mediaType === 'PHOTO').length})</span>
            </button>
            <button
              onClick={() => setFilterType('VIDEO')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'VIDEO' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({items.filter((i) => i.mediaType === 'VIDEO').length})</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-600"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search title, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Grid of Gallery Items */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-6 h-6 text-red-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading daily work gallery...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">No Gallery Items Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || filterType !== 'ALL' || filterCategory !== 'ALL'
              ? 'No items matched your active filter criteria.'
              : 'Start uploading your daily electrical work photos and videos to showcase to customers.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Work</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isVideo = item.mediaType === 'VIDEO';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                {/* Media Preview Container with universal embed & photo support */}
                <div
                  onClick={() => setPreviewItem(item)}
                  className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                  title="Click to preview player"
                >
                  <MediaRenderer
                    mediaUrl={item.mediaUrl}
                    thumbnailUrl={item.thumbnailUrl}
                    mediaType={item.mediaType}
                    storageProvider={item.storageProvider}
                    title={item.title}
                    mode="thumbnail"
                  />

                  {/* Publish Status Badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePublish(item);
                    }}
                    className="absolute top-2.5 right-2.5 z-10"
                    title={item.isPublished ? 'Published on live website' : 'Draft / Hidden from public'}
                  >
                    {item.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        <Eye className="w-3 h-3" />
                        <span>Live</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-white shadow-xs">
                        <EyeOff className="w-3 h-3" />
                        <span>Draft</span>
                      </span>
                    )}
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 mb-1">
                      <Layers className="w-3 h-3" />
                      <span>{item.category}</span>
                    </div>

                    <h2 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h2>

                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata and Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3 text-[11px]">
                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span className="truncate max-w-[110px]">{item.location}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.dateTaken).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        title="Preview Player in Lightbox"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-start justify-center pt-14 pb-16 bg-transparent"
        >
          <div className="bg-white rounded-xl border border-slate-300 ring-1 ring-black/10 max-w-2xl w-full p-6 shadow-2xl space-y-5 my-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${mediaType === 'VIDEO' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {mediaType === 'VIDEO' ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Work Item' : 'Upload Daily Work Photo / Video / Link'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Supports direct file upload (R2/Cloudinary) or any YouTube, Facebook, Instagram, TikTok, or web link
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Media Type & Source Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Media Type & Source Engine
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSourceTabChange('PHOTO')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      sourceCategory === 'PHOTO'
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Work Photo</div>
                      <div className="text-[10px] text-slate-500">Cloudinary / Web Image</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSourceTabChange('VIDEO')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      sourceCategory === 'VIDEO'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Work Video</div>
                      <div className="text-[10px] text-slate-500">Cloudflare R2 / Direct HD</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSourceTabChange('EMBED')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      sourceCategory === 'EMBED'
                        ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Social / Web Embed</div>
                      <div className="text-[10px] text-slate-500">YouTube, FB, Insta, TikTok</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone (For direct Cloudinary or R2 uploads) */}
              {sourceCategory !== 'EMBED' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={mediaType === 'VIDEO' ? 'video/*' : 'image/*'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-800">
                      Click to upload {mediaType === 'VIDEO' ? 'video file (<500MB)' : 'photo (<100MB)'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {mediaType === 'VIDEO'
                        ? 'MP4, WebM, MOV, AVI via Cloudflare R2'
                        : 'JPG, PNG, WebP, HEIC via Cloudinary CDN'}
                    </p>
                  </div>

                  {uploadProgress !== null && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>Uploading to {storageProvider}...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Media URL Preview and Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Media Source URL or Embed Link *
                  </label>
                  <span className="text-[10px] text-slate-500">Auto-detected in real-time</span>
                </div>

                <input
                  type="text"
                  required
                  placeholder={
                    sourceCategory === 'EMBED'
                      ? 'Paste YouTube, Facebook video, Instagram Reel, TikTok, Drive, or iframe link...'
                      : mediaType === 'VIDEO'
                      ? 'https://r2.voltixnepal.com/videos/... or paste any video link'
                      : 'https://res.cloudinary.com/... or paste any image link'
                  }
                  value={mediaUrl}
                  onChange={(e) => handleMediaUrlChange(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                />

                {/* Supported sources helper chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">Supports:</span>
                  {[
                    'YouTube',
                    'Facebook Video/Reel',
                    'Instagram Reel',
                    'TikTok',
                    'Vimeo',
                    'Google Drive',
                    'Cloudflare R2',
                    'Cloudinary',
                    'Direct MP4/Image',
                  ].map((p) => (
                    <span
                      key={p}
                      className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Real-time Live Media & Embed Preview Box */}
              {mediaUrl.trim() && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Live Media & Embed Player Preview</span>
                    </span>
                    <MediaPlatformBadge
                      mediaUrl={mediaUrl}
                      fallbackMediaType={mediaType}
                      customProvider={storageProvider}
                    />
                  </div>

                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black max-h-56 flex items-center justify-center">
                    <MediaRenderer
                      mediaUrl={mediaUrl}
                      thumbnailUrl={thumbnailUrl}
                      mediaType={mediaType}
                      storageProvider={storageProvider}
                      title={title || 'Preview'}
                      mode="player"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    This live preview confirms your video or photo displays properly on the public customer gallery.
                  </p>
                </div>
              )}

              {/* Cover Thumbnail URL Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Cover Thumbnail URL (Optional / Auto-generated)
                  </label>
                  {thumbnailUrl && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Thumbnail set</span>
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Auto-filled for YouTube; or paste custom image link for video cover"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Work Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3-Storey House Concealed Wiring"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Location in Nepal</label>
                  <input
                    type="text"
                    placeholder="e.g. Baneshwor, Kathmandu"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date Taken</label>
                  <input
                    type="date"
                    value={dateTaken}
                    onChange={(e) => setDateTaken(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Technical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Explain what was done (e.g. 16A MCB replacement, copper busbar balancing, 400m conduit drawn...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Publish to Public Gallery</div>
                  <div className="text-[11px] text-slate-500">
                    When enabled, this work is visible on the public /gallery page.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || uploadProgress !== null}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Gallery Item' : 'Publish to Gallery'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Lightbox Live Player Preview Modal */}
      {previewItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewItem(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl border border-slate-300 ring-1 ring-black/10 max-w-3xl w-full overflow-hidden shadow-2xl space-y-0 my-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{previewItem.category}</span>
                </span>
                <MediaPlatformBadge
                  mediaUrl={previewItem.mediaUrl}
                  fallbackMediaType={previewItem.mediaType}
                  customProvider={previewItem.storageProvider}
                />
              </div>

              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player */}
            <div className="bg-black aspect-video max-h-[480px] flex items-center justify-center relative overflow-hidden">
              <MediaRenderer
                mediaUrl={previewItem.mediaUrl}
                thumbnailUrl={previewItem.thumbnailUrl}
                mediaType={previewItem.mediaType}
                storageProvider={previewItem.storageProvider}
                title={previewItem.title}
                mode="player"
                autoPlay={true}
              />
            </div>

            {/* Details */}
            <div className="p-5 sm:p-6 space-y-3 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {previewItem.title}
                  </h2>
                  {previewItem.description && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {previewItem.description}
                    </p>
                  )}
                </div>

                {previewItem.mediaUrl && (
                  <a
                    href={previewItem.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 self-start shrink-0 transition-colors"
                  >
                    <span>Open Source</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Location: {previewItem.location || 'Kathmandu Valley'}</span>
                <span>Date: {new Date(previewItem.dateTaken).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
