'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Star,
  CheckCircle2,
} from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials?all=true');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenEdit = (item: any) => {
    setEditingItem({ ...item });
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setEditingItem({
      customerName: '',
      location: 'Kathmandu',
      rating: 5,
      content: '',
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      isApproved: true,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew
        ? '/api/testimonials'
        : `/api/testimonials/${editingItem.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingItem,
          rating: Number(editingItem.rating),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        fetchTestimonials();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTestimonials();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer Testimonials Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve, add, or edit legitimate customer feedback and star ratings
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading testimonials...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 hover:bg-slate-50/70 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">
                      {t.customerName}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({t.location})
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{t.content}"
                  </p>

                  <div className="text-[11px] text-slate-400">
                    Dated: {t.date}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="btn-secondary text-xs py-1 px-2.5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="btn-secondary text-xs py-1 px-2.5 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-start justify-center pt-16 sm:pt-20 pb-16">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-slate-100 pb-3 -mt-1 pt-1">
              <h2 className="text-base font-bold text-slate-900 truncate pr-2">
                {isNew ? 'New Testimonial' : 'Edit Testimonial'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.customerName}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        customerName: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Location / Tole</label>
                  <input
                    type="text"
                    required
                    value={editingItem.location}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        location: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Rating (1 to 5 Stars)</label>
                  <select
                    value={editingItem.rating}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        rating: Number(e.target.value),
                      })
                    }
                    className="form-input text-xs bg-white"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Good)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs">Date Text</label>
                  <input
                    type="text"
                    value={editingItem.date}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, date: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Customer Feedback Text</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.content}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, content: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isApproved}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        isApproved: e.target.checked,
                      })
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Approved for Public Display
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
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
                    <span>Save Testimonial</span>
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
