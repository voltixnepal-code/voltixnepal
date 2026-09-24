'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminHomepageBuilder() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/homepage-sections');
      const data = await res.json();
      if (data.success) {
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const moveSection = (index: number, direction: 'UP' | 'DOWN') => {
    const newSections = [...sections];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update sortOrder values
    newSections.forEach((sec, idx) => {
      sec.sortOrder = idx + 1;
    });

    setSections(newSections);
  };

  const toggleSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].isEnabled = !newSections[index].isEnabled;
    setSections(newSections);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage(false);
    setErrorMessage(null);
    try {
      const res = await adminFetch('/api/homepage-sections', {
        method: 'PUT',
        body: JSON.stringify({ sections }),
      });
      if (res.ok && res.data?.success) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to update homepage layout.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Homepage Layout & Section Ordering
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enable, disable, and rearrange homepage sections effortlessly
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Homepage Layout</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Homepage layout updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading section layout...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sections.map((sec, idx) => (
              <div
                key={sec.id || sec.sectionKey}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {sec.label}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Key: {sec.sectionKey}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Toggle Visible */}
                  <button
                    onClick={() => toggleSection(idx)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                      sec.isEnabled
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    {sec.isEnabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Move Up / Down */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSection(idx, 'UP')}
                      disabled={idx === 0}
                      className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'DOWN')}
                      disabled={idx === sections.length - 1}
                      className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
