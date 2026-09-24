'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import CloudinaryUploader from '@/components/common/CloudinaryUploader';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services?all=true');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenEdit = (service: any) => {
    setErrorMessage(null);
    setEditingService({
      ...service,
      benefitsArray: JSON.parse(service.benefits || '[]').join('\n'),
      includedArray: JSON.parse(service.includedItems || '[]').join('\n'),
      whenNeededArray: JSON.parse(service.whenNeeded || '[]').join('\n'),
    });
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setErrorMessage(null);
    setEditingService({
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      category: 'Residential',
      priceDisplay: 'Inspection from Rs. 500',
      imageUrl:
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      iconName: 'Zap',
      benefitsArray: 'Safe electrical load balancing\nQuality certified copper wires',
      includedArray: 'Site inspection\nInsulation testing',
      whenNeededArray: 'New house construction\nRecurring electrical short circuits',
      serviceArea: 'Kathmandu Valley',
      isActive: true,
      sortOrder: services.length + 1,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        title: editingService.title,
        slug: editingService.slug || undefined,
        shortDescription: editingService.shortDescription,
        fullDescription: editingService.fullDescription,
        category: editingService.category,
        priceDisplay: editingService.priceDisplay,
        imageUrl: editingService.imageUrl,
        iconName: editingService.iconName,
        benefits: editingService.benefitsArray
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean),
        includedItems: editingService.includedArray
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean),
        whenNeeded: editingService.whenNeededArray
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean),
        serviceArea: editingService.serviceArea,
        isActive: editingService.isActive,
        sortOrder: Number(editingService.sortOrder),
      };

      const url = isNew
        ? '/api/services'
        : `/api/services/${editingService.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok && res.data?.success) {
        setEditingService(null);
        setErrorMessage(null);
        fetchServices();
      } else {
        setErrorMessage(res.error || 'Failed to save service. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await adminFetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        alert(res.error || 'Failed to delete service.');
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
            Services Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, update, or reorganize electrical service offerings and descriptions
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading services...
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price Display</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-500">
                    #{s.sortOrder}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{s.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      /services/{s.slug}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {s.priceDisplay || 'Quote on site'}
                  </td>
                  <td className="py-3 px-4">
                    {s.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-xs">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Disabled</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.title)}
                      className="btn-secondary text-xs py-1 px-2.5 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit / New Modal */}
      {editingService && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingService(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-start justify-center pt-16 sm:pt-20 pb-16"
        >
          <div className="bg-white rounded-xl border border-slate-300 ring-1 ring-black/10 max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-slate-100 pb-3 -mt-1 pt-1">
              <h2 className="text-base font-bold text-slate-900 truncate pr-2">
                {isNew ? 'Create New Service' : `Edit Service: ${editingService.title}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingService(null)}
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
                  <label className="form-label text-xs">Service Title</label>
                  <input
                    type="text"
                    required
                    value={editingService.title}
                    onChange={(e) =>
                      setEditingService({ ...editingService, title: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Category</label>
                  <select
                    value={editingService.category}
                    onChange={(e) =>
                      setEditingService({ ...editingService, category: e.target.value })
                    }
                    className="form-input text-xs bg-white"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Installation">Installation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Price Display Text</label>
                  <input
                    type="text"
                    value={editingService.priceDisplay || ''}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        priceDisplay: e.target.value,
                      })
                    }
                    placeholder="e.g. Diagnostic from Rs. 600"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <CloudinaryUploader
                  label="Service Image / Demonstration Video (Cloudinary)"
                  value={editingService.imageUrl}
                  onChange={(url) =>
                    setEditingService({ ...editingService, imageUrl: url })
                  }
                  folder="voltixnepal/services"
                />
              </div>

              <div>
                <label className="form-label text-xs">Short Summary (for cards)</label>
                <input
                  type="text"
                  required
                  value={editingService.shortDescription}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      shortDescription: e.target.value,
                    })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Full Detail Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingService.fullDescription}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      fullDescription: e.target.value,
                    })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xs">Key Benefits (1 per line)</label>
                  <textarea
                    rows={3}
                    value={editingService.benefitsArray}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        benefitsArray: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">What is Included (1 per line)</label>
                  <textarea
                    rows={3}
                    value={editingService.includedArray}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        includedArray: e.target.value,
                      })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">When Needed (1 per line)</label>
                  <textarea
                    rows={3}
                    value={editingService.whenNeededArray}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        whenNeededArray: e.target.value,
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
                    checked={editingService.isActive}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        isActive: e.target.checked,
                      })
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-800">Active / Visible on Website</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
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
                    <span>Save Service</span>
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
