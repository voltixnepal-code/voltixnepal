'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  Check,
  User,
  SlidersHorizontal,
  Wrench,
  MessageSquareQuote,
  HelpCircle,
  FileText,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminHomepageBuilder() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingLayout, setSavingLayout] = useState(false);
  const [savedLayoutMessage, setSavedLayoutMessage] = useState(false);
  const [errorLayoutMessage, setErrorLayoutMessage] = useState<string | null>(null);

  // Contractor / About Section Form State
  const [aboutSettings, setAboutSettings] = useState({
    ownerName: 'Sanjit Mishra',
    phone: '+977 9825870047',
    aboutOwnerTitle: 'Lead Electrician & Proprietor',
    aboutOwnerPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
    aboutHeadline: 'Experienced Hands-On Electrical Contractor in Kathmandu',
    aboutBio1: 'Hello, I am {ownerName}, the founder and chief electrician at VoltixNepal. I specialize in providing dependable, safe, and modern electrical services for residential apartments, independent homes, and commercial offices across Kathmandu Valley.',
    aboutBio2: 'Whether you are rewiring a building, diagnosing a recurring circuit breaker trip, installing an inverter backup, or dealing with an unexpected power short circuit, I ensure meticulous attention to detail and zero compromises on safety standards.',
    aboutHighlights: '["House Wiring & Concealed Piping","Short Circuit Diagnostic & Megger Test","Inverter & Battery Wiring","Distribution Board Balancing"]',
    aboutBookBtnText: 'Book a Service with Sanjit',
  });

  const [savingAbout, setSavingAbout] = useState(false);
  const [savedAboutSuccess, setSavedAboutSuccess] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/homepage-sections');
      const data = await res.json();
      if (data.success) {
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAboutSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setAboutSettings((prev) => ({
          ...prev,
          ownerName: data.settings.ownerName || prev.ownerName,
          phone: data.settings.phone || prev.phone,
          aboutOwnerTitle: data.settings.aboutOwnerTitle || prev.aboutOwnerTitle,
          aboutOwnerPhoto: data.settings.aboutOwnerPhoto || prev.aboutOwnerPhoto,
          aboutHeadline: data.settings.aboutHeadline || prev.aboutHeadline,
          aboutBio1: data.settings.aboutBio1 || prev.aboutBio1,
          aboutBio2: data.settings.aboutBio2 || prev.aboutBio2,
          aboutHighlights: data.settings.aboutHighlights || prev.aboutHighlights,
          aboutBookBtnText: data.settings.aboutBookBtnText || prev.aboutBookBtnText,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchSections(), fetchAboutSettings()]).finally(() => setLoading(false));
  }, []);

  const moveSection = (index: number, direction: 'UP' | 'DOWN') => {
    const newSections = [...sections];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

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

  const handleSaveLayout = async () => {
    setSavingLayout(true);
    setSavedLayoutMessage(false);
    setErrorLayoutMessage(null);
    try {
      const res = await adminFetch('/api/homepage-sections', {
        method: 'PUT',
        body: JSON.stringify({ sections }),
      });
      if (res.ok && res.data?.success) {
        setSavedLayoutMessage(true);
        setTimeout(() => setSavedLayoutMessage(false), 3000);
      } else {
        setErrorLayoutMessage(res.error || 'Failed to update homepage layout.');
      }
    } catch (err: any) {
      setErrorLayoutMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSavingLayout(false);
    }
  };

  // Highlights management
  let highlightsList: string[] = [
    'House Wiring & Concealed Piping',
    'Short Circuit Diagnostic & Megger Test',
    'Inverter & Battery Wiring',
    'Distribution Board Balancing',
  ];
  try {
    if (aboutSettings.aboutHighlights) {
      const parsed = JSON.parse(aboutSettings.aboutHighlights);
      if (Array.isArray(parsed) && parsed.length > 0) highlightsList = parsed;
    }
  } catch {}

  const updateHighlight = (idx: number, val: string) => {
    const next = [...highlightsList];
    next[idx] = val;
    setAboutSettings((prev) => ({ ...prev, aboutHighlights: JSON.stringify(next) }));
  };

  const addHighlight = () => {
    const next = [...highlightsList, 'New Service Highlight'];
    setAboutSettings((prev) => ({ ...prev, aboutHighlights: JSON.stringify(next) }));
  };

  const removeHighlight = (idx: number) => {
    const next = highlightsList.filter((_, i) => i !== idx);
    setAboutSettings((prev) => ({ ...prev, aboutHighlights: JSON.stringify(next) }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      setAboutError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'voltixnepal/about');

      const res = await adminFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = res.data || {};
      if (res.ok && data.success) {
        const url = data.secure_url || data.url;
        setAboutSettings((prev) => ({ ...prev, aboutOwnerPhoto: url }));
      } else {
        throw new Error(res.error || data.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      setAboutError(err.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAbout(true);
    setSavedAboutSuccess(false);
    setAboutError(null);

    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          ownerName: aboutSettings.ownerName,
          phone: aboutSettings.phone,
          aboutOwnerTitle: aboutSettings.aboutOwnerTitle,
          aboutOwnerPhoto: aboutSettings.aboutOwnerPhoto,
          aboutHeadline: aboutSettings.aboutHeadline,
          aboutBio1: aboutSettings.aboutBio1,
          aboutBio2: aboutSettings.aboutBio2,
          aboutHighlights: aboutSettings.aboutHighlights,
          aboutBookBtnText: aboutSettings.aboutBookBtnText,
        }),
      });

      if (res.ok && res.data?.success) {
        setSavedAboutSuccess(true);
        setTimeout(() => setSavedAboutSuccess(false), 3500);
      } else {
        const err = res.data?.message || res.error || 'Failed to save changes. Please try again.';
        throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
      }
    } catch (err: any) {
      setAboutError(err.message || 'An error occurred while saving.');
    } finally {
      setSavingAbout(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Homepage Content & Layout
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage section content and ordering on the live homepage.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View Live Site</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* CONTRACTOR SECTION CONTENT EDITOR (NORMAL, CLEAN HUMAN DESIGN) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Clean Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Contractor Profile Section (&ldquo;Experienced Hands-On Electrical Contractor&rdquo;)
              </h2>
              <p className="text-xs text-slate-500">
                Homepage section with contractor photo, biography, services checklist, and direct contact.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAbout}
            disabled={savingAbout}
            className="btn-primary text-xs flex items-center gap-1.5 shrink-0"
          >
            {savingAbout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savingAbout ? 'Saving...' : 'Save Section'}</span>
          </button>
        </div>

        {/* Alerts */}
        {savedAboutSuccess && (
          <div className="m-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Saved successfully! Changes are live on the homepage.</span>
          </div>
        )}

        {aboutError && (
          <div className="m-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{aboutError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSaveAbout} className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Photo Column */}
            <div className="lg:col-span-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">Contractor Photo</label>

              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]">
                {aboutSettings.aboutOwnerPhoto ? (
                  <img
                    src={aboutSettings.aboutOwnerPhoto}
                    alt={aboutSettings.ownerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No photo uploaded
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 w-full justify-center"
                >
                  {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Upload className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500">Or paste Image URL directly</label>
                <input
                  type="url"
                  value={aboutSettings.aboutOwnerPhoto || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutOwnerPhoto: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input text-xs w-full"
                />
              </div>

              {/* Name & Title */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contractor Name</label>
                  <input
                    type="text"
                    value={aboutSettings.ownerName}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, ownerName: e.target.value })}
                    className="form-input text-xs w-full mt-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Designation / Role Title</label>
                  <input
                    type="text"
                    value={aboutSettings.aboutOwnerTitle || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, aboutOwnerTitle: e.target.value })}
                    placeholder="Lead Electrician & Proprietor"
                    className="form-input text-xs w-full mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Right: Text & Content Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Main Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Headline Title</label>
                <input
                  type="text"
                  value={aboutSettings.aboutHeadline || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutHeadline: e.target.value })}
                  placeholder="Experienced Hands-On Electrical Contractor in Kathmandu"
                  className="form-input text-sm font-bold w-full mt-1"
                />
              </div>

              {/* Paragraph 1 */}
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Intro Paragraph (Bio 1)
                </label>
                <textarea
                  rows={3}
                  value={aboutSettings.aboutBio1 || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutBio1: e.target.value })}
                  placeholder="Hello, I am {ownerName}, the founder and chief electrician at VoltixNepal..."
                  className="form-input text-xs w-full mt-1"
                />
              </div>

              {/* Paragraph 2 */}
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Service Description (Bio 2)
                </label>
                <textarea
                  rows={3}
                  value={aboutSettings.aboutBio2 || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutBio2: e.target.value })}
                  placeholder="Whether you are rewiring a building, diagnosing a recurring circuit breaker trip..."
                  className="form-input text-xs w-full mt-1"
                />
              </div>

              {/* 4 Bullet Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Service Checkpoints (Bulleted Highlights)
                  </label>
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlightsList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                      <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateHighlight(idx, e.target.value)}
                        className="w-full text-xs bg-transparent border-0 focus:outline-none text-slate-800 font-medium"
                      />
                      {highlightsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHighlight(idx)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Button & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Booking Button Text</label>
                  <input
                    type="text"
                    value={aboutSettings.aboutBookBtnText || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, aboutBookBtnText: e.target.value })}
                    placeholder="Book a Service with Sanjit"
                    className="form-input text-xs w-full mt-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Call Directly Phone Number</label>
                  <input
                    type="text"
                    value={aboutSettings.phone || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, phone: e.target.value })}
                    placeholder="+977 9825870047"
                    className="form-input text-xs w-full mt-1"
                  />
                </div>
              </div>

              {/* Save Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingAbout}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {savingAbout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingAbout ? 'Saving...' : 'Save Section'}</span>
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* SECTION ORDERING & TOGGLES */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Homepage Section Layout & Ordering</span>
            </h2>
            <p className="text-xs text-slate-500">
              Use arrows to arrange order or toggle to hide/show sections on the homepage.
            </p>
          </div>

          <button
            onClick={handleSaveLayout}
            disabled={savingLayout}
            className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            {savingLayout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Order</span>
          </button>
        </div>

        {savedLayoutMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Section ordering updated successfully!</span>
          </div>
        )}

        {errorLayoutMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorLayoutMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {sections.map((sec, idx) => {
            const isAbout = sec.sectionKey === 'about' || sec.sectionKey === 'about_snippet';

            return (
              <div
                key={sec.id || sec.sectionKey}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-xs text-slate-900">{sec.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-2">key: {sec.sectionKey}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick edit links */}
                  {isAbout ? (
                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      Edit Content (Above)
                    </button>
                  ) : sec.sectionKey === 'hero' ? (
                    <Link
                      href="/admin/hero"
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                      <span>Edit Slides</span>
                    </Link>
                  ) : sec.sectionKey === 'services' ? (
                    <Link
                      href="/admin/services"
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
                    >
                      <Wrench className="w-3 h-3 text-slate-400" />
                      <span>Edit Services</span>
                    </Link>
                  ) : sec.sectionKey === 'testimonials' ? (
                    <Link
                      href="/admin/testimonials"
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
                    >
                      <MessageSquareQuote className="w-3 h-3 text-slate-400" />
                      <span>Edit Reviews</span>
                    </Link>
                  ) : sec.sectionKey === 'faq' ? (
                    <Link
                      href="/admin/faq"
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                      <span>Edit FAQs</span>
                    </Link>
                  ) : sec.sectionKey === 'blog' ? (
                    <Link
                      href="/admin/blog"
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>Edit Blog</span>
                    </Link>
                  ) : null}

                  {/* Toggle Visible */}
                  <button
                    type="button"
                    onClick={() => toggleSection(idx)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 border ${
                      sec.isEnabled
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    {sec.isEnabled ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Move Up / Down */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(idx, 'UP')}
                      disabled={idx === 0}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, 'DOWN')}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
