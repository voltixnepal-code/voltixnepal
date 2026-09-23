'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Film,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  HardDrive,
  Trash2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import CloudinaryUploader from '@/components/common/CloudinaryUploader';

interface UploadedMediaItem {
  id: string;
  url: string;
  public_id: string;
  format: string;
  size_mb: string;
  bytes: number;
  resource_type: string;
  timestamp: string;
  filename: string;
}

export default function AdminMediaPage() {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80',
      public_id: 'sample_electrical_hero',
      format: 'jpg',
      size_mb: '1.24',
      bytes: 1300000,
      resource_type: 'image',
      timestamp: 'Default Asset',
      filename: 'electrical-switchboard-hero.jpg',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      public_id: 'sample_server_wiring',
      format: 'jpg',
      size_mb: '0.85',
      bytes: 890000,
      resource_type: 'image',
      timestamp: 'Default Asset',
      filename: 'commercial-panel-wiring.jpg',
    },
  ]);

  const [lastUploadedUrl, setLastUploadedUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleMediaUploaded = (url: string, meta?: any) => {
    setLastUploadedUrl(url);
    if (meta) {
      const newItem: UploadedMediaItem = {
        id: meta.public_id || Date.now().toString(),
        url: meta.secure_url || url,
        public_id: meta.public_id || 'upload_' + Date.now(),
        format: meta.format || 'auto',
        size_mb: meta.size_mb || '0.50',
        bytes: meta.bytes || 500000,
        resource_type: meta.resource_type || 'image',
        timestamp: new Date().toLocaleTimeString(),
        filename: meta.original_filename || 'media_asset',
      };
      setUploadedMedia((prev) => [newItem, ...prev]);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteItem = (id: string) => {
    setUploadedMedia((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Cloudinary Media Storage & CDN</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              Connected
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage high-speed CDN delivery for photos, videos, and documentation. Strictly capped at 95MB per upload.
          </p>
        </div>
      </div>

      {/* Cloudinary Environment Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Cloud Name</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-base font-bold text-slate-900 font-mono">scmeiafw</p>
          <p className="text-[11px] text-slate-400">Authenticated Cloudinary Storage</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Max Upload Size Limit</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-emerald-600 font-mono">95 MB / file</p>
          <p className="text-[11px] text-slate-400">Strictly enforced on client & backend</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Supported Types</span>
            <Film className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-base font-bold text-slate-900">Images, Videos & Docs</p>
          <p className="text-[11px] text-slate-400">Auto WebP / MP4 / HLS compression</p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <UploadCloud className="w-4 h-4 text-blue-600" />
          <span>Upload Media Asset (Photos or Videos &le; 95MB)</span>
        </h2>

        <CloudinaryUploader
          value={lastUploadedUrl}
          onChange={handleMediaUploaded}
          folder="voltixnepal/media"
          label="Select or Drag any file (Max 95MB)"
          helperText="Files and videos are automatically uploaded to your Cloudinary cloud (scmeiafw) and distributed via high-speed global CDN."
        />
      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Media Asset Library</h3>
          <span className="text-xs text-slate-500 font-medium">
            {uploadedMedia.length} assets listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Filename / Public ID</th>
                <th className="py-3 px-4">Type & Format</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uploadedMedia.map((item) => {
                const isVid =
                  item.resource_type === 'video' ||
                  item.url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-14 h-10 rounded bg-slate-900 overflow-hidden flex items-center justify-center">
                        {isVid ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <Image
                            src={item.url}
                            alt={item.filename}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.filename}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                        {item.url}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase">
                        {item.resource_type} • {item.format}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {item.size_mb} MB
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.url)}
                          className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy CDN Link</span>
                            </>
                          )}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
