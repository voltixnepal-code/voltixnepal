'use client';

import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import CloudinaryUploader from '@/components/common/CloudinaryUploader';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hero-slides?all=true');
      const data = await res.json();
      if (data.success) {
        setSlides(data.slides || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenEdit = (slide: any) => {
    setErrorMessage(null);
    setEditingSlide({ ...slide });
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setErrorMessage(null);
    setEditingSlide({
      badge: 'PROFESSIONAL ELECTRICAL SERVICES',
      title: 'Reliable Electrical Services in Kathmandu',
      description: 'Expert home electrical repair, wiring, and inverter setup by Sanjit Mishra.',
      primaryBtnText: 'Request a Service',
      primaryBtnLink: '/request-service',
      secondaryBtnText: 'Call Now',
      secondaryBtnLink: 'tel:+9779800000000',
      imageUrl:
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: slides.length + 1,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const url = isNew
        ? '/api/hero-slides'
        : `/api/hero-slides/${editingSlide.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify({
          ...editingSlide,
          sortOrder: Number(editingSlide.sortOrder),
        }),
      });

      if (res.ok && res.data?.success) {
        setEditingSlide(null);
        setErrorMessage(null);
        fetchSlides();
      } else {
        setErrorMessage(res.error || 'Failed to save slide.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    try {
      const res = await adminFetch(`/api/hero-slides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSlides();
      } else {
        alert(res.error || 'Failed to delete slide.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hero Slider Management (5 Slides)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize banner images, headings, badges, and action buttons without touching source code
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Slide</span>
        </button>
      </div>

      {/* Slide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div>
              {/* Photo Preview */}
              <div className="relative h-44 w-full bg-slate-900">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover brightness-75"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[11px]">
                    Slide #{slide.sortOrder}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900/80 text-white font-semibold text-[11px]">
                    {slide.badge}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">{slide.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {slide.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-red-600">
                    CTA: {slide.primaryBtnText}
                  </span>
                  {slide.secondaryBtnText && (
                    <>
                      <span>•</span>
                      <span>Secondary: {slide.secondaryBtnText}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`text-xs font-semibold ${
                  slide.isActive ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {slide.isActive ? '● Active in slider' : '○ Inactive'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(slide)}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  Edit Slide
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="btn-secondary text-xs py-1 px-2 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSlide && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingSlide(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-start justify-center pt-16 sm:pt-20 pb-16"
        >
          <div className="bg-white rounded-xl border border-slate-300 ring-1 ring-black/10 max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-slate-100 pb-3 -mt-1 pt-1">
              <h2 className="text-base font-bold text-slate-900 truncate pr-2">
                {isNew ? 'New Hero Slide' : `Edit Slide #${editingSlide.sortOrder}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Small Top Badge</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.badge}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, badge: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Slide Order (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={editingSlide.sortOrder}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, sortOrder: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Main Heading</label>
                <input
                  type="text"
                  required
                  value={editingSlide.title}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, title: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Supporting Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingSlide.description}
                  onChange={(e) =>
                    setEditingSlide({
                      ...editingSlide,
                      description: e.target.value,
                    })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div>
                <CloudinaryUploader
                  label="Slide Image / Video (Cloudinary)"
                  value={editingSlide.imageUrl}
                  onChange={(url) => setEditingSlide({ ...editingSlide, imageUrl: url })}
                  folder="voltixnepal/hero"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Primary Button Text</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.primaryBtnText}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        primaryBtnText: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Primary Button Link</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.primaryBtnLink}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        primaryBtnLink: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Secondary Button Text (Optional)</label>
                  <input
                    type="text"
                    value={editingSlide.secondaryBtnText || ''}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        secondaryBtnText: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Secondary Button Link (Optional)</label>
                  <input
                    type="text"
                    value={editingSlide.secondaryBtnLink || ''}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        secondaryBtnLink: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSlide.isActive}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        isActive: e.target.checked,
                      })
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-800">Slide Active</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlide(null)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Slide</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
