'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Film,
  Image as ImageIcon,
  Copy,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

interface CloudinaryUploaderProps {
  value?: string;
  onChange: (url: string, metadata?: any) => void;
  folder?: string;
  label?: string;
  acceptedTypes?: string;
  maxSizeMB?: number; // Defaults to 95MB
  helperText?: string;
}

export default function CloudinaryUploader({
  value = '',
  onChange,
  folder = 'voltixnepal/media',
  label = 'Media / Video Asset (Cloudinary Storage)',
  acceptedTypes = 'image/*,video/*,.pdf,.doc,.docx',
  maxSizeMB = 95,
  helperText = 'Files & videos up to 95MB are stored securely on Cloudinary CDN',
}: CloudinaryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleUploadFile = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Client-side 95MB limit validation
    if (file.size > maxSizeBytes) {
      const fileSizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(
        `File is too large (${fileSizeInMb} MB). Maximum allowed limit is ${maxSizeMB}MB.`
      );
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload to Cloudinary');
      }

      onChange(data.secure_url, data);
      setSuccessMessage(`Uploaded successfully (${data.size_mb || (file.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (err: any) {
      console.error('Cloudinary upload failure:', err);
      setErrorMessage(err.message || 'Upload failed. Please check network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVideo = value.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) || value.includes('/video/upload/');
  const isImage = value.match(/\.(jpeg|jpg|png|gif|webp|svg|avif)(\?.*)?$/i) || value.includes('/image/upload/') || (!isVideo && value.startsWith('http'));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span>{label}</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              Cloudinary (≤{maxSizeMB}MB)
            </span>
          </label>
          {value && (
            <button
              type="button"
              onClick={handleCopyUrl}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copied CDN URL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : isUploading
            ? 'border-slate-300 bg-slate-50 cursor-wait'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-xs font-medium text-slate-700">
              Uploading media securely to Cloudinary storage...
            </p>
            <span className="text-[11px] text-slate-400">Strict limit: under 95MB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-blue-600 hover:underline">
                Click to upload
              </span>{' '}
              or drag & drop file/video here
            </div>
            <p className="text-[11px] text-slate-400">
              Photos, Videos & Docs up to <strong>95MB</strong> (Cloudinary auto-optimized)
            </p>
          </div>
        )}
      </div>

      {/* Status & Error Alerts */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Direct URL input fallback or preview */}
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/... or paste external media link"
          className="form-input text-xs flex-1"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Clear media"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Media Preview Box */}
      {value && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
          <div className="relative w-16 h-12 bg-slate-900 rounded overflow-hidden shrink-0 flex items-center justify-center">
            {isVideo ? (
              <video
                src={value}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : isImage ? (
              <Image
                src={value}
                alt="Preview"
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <FileText className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                {isVideo ? (
                  <>
                    <Film className="w-3 h-3" /> Video Stream
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3" /> Cloudinary Asset
                  </>
                )}
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
              >
                <span>View original</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {helperText && !errorMessage && !successMessage && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
