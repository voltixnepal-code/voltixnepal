'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faq?all=true');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenEdit = (faq: any) => {
    setEditingFaq({ ...faq });
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setEditingFaq({
      question: '',
      answer: '',
      category: 'General',
      isActive: true,
      sortOrder: faqs.length + 1,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew ? '/api/faq' : `/api/faq/${editingFaq.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingFaq,
          sortOrder: Number(editingFaq.sortOrder),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingFaq(null);
        fetchFaqs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
      if (res.ok) fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add or update customer questions regarding electrical repairs, pricing, and timing
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading FAQs...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-5 hover:bg-slate-50/70 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {faq.question}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-1">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => handleOpenEdit(faq)}
                    className="btn-secondary text-xs py-1 px-2.5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
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
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isNew ? 'Create FAQ' : 'Edit FAQ'}
              </h2>
              <button
                onClick={() => setEditingFaq(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="form-label text-xs">Question</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Category</label>
                  <input
                    type="text"
                    required
                    value={editingFaq.category}
                    onChange={(e) =>
                      setEditingFaq({ ...editingFaq, category: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Sort Order</label>
                  <input
                    type="number"
                    required
                    value={editingFaq.sortOrder}
                    onChange={(e) =>
                      setEditingFaq({
                        ...editingFaq,
                        sortOrder: e.target.value,
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
                    checked={editingFaq.isActive}
                    onChange={(e) =>
                      setEditingFaq({
                        ...editingFaq,
                        isActive: e.target.checked,
                      })
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Active / Display on Website
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFaq(null)}
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
                    <span>Save FAQ</span>
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
