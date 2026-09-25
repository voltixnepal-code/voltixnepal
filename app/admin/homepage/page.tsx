'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Edit3,
  ExternalLink,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Phone,
  User,
  SlidersHorizontal,
  Wrench,
  MessageSquareQuote,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminHomepageBuilder() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingLayout, setSavingLayout] = useState(false);
  const [savedLayoutMessage, setSavedLayoutMessage] = useState(false);
  const [errorLayoutMessage, setErrorLayoutMessage] = useState<string | null>(null);

  // Active section to edit content inline (default open to 'about' so user sees it right away!)
  const [editingSection, setEditingSection] = useState<'about' | null>('about');

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
        body: JSON.stringify(aboutSettings),
      });

      if (res.ok && res.data?.success) {
        setSavedAboutSuccess(true);
        setTimeout(() => setSavedAboutSuccess(false), 3500);
      } else {
        throw new Error(res.error || res.data?.message || 'Failed to save changes');
      }
    } catch (err: any) {
      setAboutError(err.message || 'An error occurred while saving.');
    } finally {
      setSavingAbout(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Homepage Layout & Sections CMS
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
              Live Homepage Editor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Edit text, headlines, photos, and order for all sections on the front page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Live Website</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION EDIT FOCUS: "Experienced Hands-On Electrical Contractor" (ABOUT) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-red-500/80 shadow-md overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600/40 text-red-300 font-bold text-[10px] uppercase border border-red-500/40">
                  Featured Homepage Section
                </span>
                <span className="text-xs text-slate-400 font-mono">key: about</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                Contractor Profile: &ldquo;Experienced Hands-On Electrical Contractor in Kathmandu&rdquo;
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAbout}
            disabled={savingAbout}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            {savingAbout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{savingAbout ? 'Saving to Homepage...' : 'Save Section Changes'}</span>
          </button>
        </div>

        {/* Success/Error Alerts */}
        {savedAboutSuccess && (
          <div className="m-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Success! The &ldquo;Experienced Hands-On Electrical Contractor&rdquo; section has been updated live on your homepage.</span>
          </div>
        )}

        {aboutError && (
          <div className="m-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{aboutError}</span>
          </div>
        )}

        {/* Live Visual Preview & Editor Grid */}
        <form onSubmit={handleSaveAbout} className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Photo & Contractor Card */}
            <div className="lg:col-span-4 space-y-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Contractor Photo & Card
              </label>

              {/* Photo Box with Overlay */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] group shadow-inner">
                {aboutSettings.aboutOwnerPhoto ? (
                  <img
                    src={aboutSettings.aboutOwnerPhoto}
                    alt={aboutSettings.ownerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <User className="w-12 h-12" />
                    <span className="text-[11px] mt-1">No Photo</span>
                  </div>
                )}

                {/* Upload Button Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:bg-slate-100"
                  >
                    {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Upload className="w-3.5 h-3.5 text-red-600" />}
                    <span>{uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                  </button>
                  <span className="text-[10px] text-slate-200">JPG, PNG, WebP up to 95MB</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">Photo URL (or upload above)</label>
                <input
                  type="url"
                  value={aboutSettings.aboutOwnerPhoto || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutOwnerPhoto: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 font-mono"
                />
              </div>

              {/* Contractor Name & Title Badge */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Contractor Name
                  </label>
                  <input
                    type="text"
                    value={aboutSettings.ownerName}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, ownerName: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-red-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={aboutSettings.aboutOwnerTitle || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, aboutOwnerTitle: e.target.value })}
                    placeholder="Lead Electrician & Proprietor"
                    className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>Badge on Photo:</span>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VoltixNepal
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Headline, Bio Text, Bullets, and Buttons */}
            <div className="lg:col-span-8 space-y-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Headline & Content Paragraphs
              </label>

              {/* Big Headline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Headline Title (The Main Large Title)
                </label>
                <input
                  type="text"
                  value={aboutSettings.aboutHeadline || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutHeadline: e.target.value })}
                  placeholder="Experienced Hands-On Electrical Contractor in Kathmandu"
                  className="w-full px-3.5 py-2.5 text-sm font-extrabold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 text-slate-900"
                />
              </div>

              {/* Paragraph 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Paragraph 1 (Introduction)</label>
                  <span className="text-[10px] text-slate-500">
                    Use <code>{'{ownerName}'}</code> to auto-insert the contractor name
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={aboutSettings.aboutBio1 || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutBio1: e.target.value })}
                  placeholder="Hello, I am {ownerName}, the founder and chief electrician at VoltixNepal..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 text-slate-800 leading-relaxed"
                />
              </div>

              {/* Paragraph 2 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Paragraph 2 (Services & Safety Guarantee)</label>
                <textarea
                  rows={3}
                  value={aboutSettings.aboutBio2 || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, aboutBio2: e.target.value })}
                  placeholder="Whether you are rewiring a building, diagnosing a recurring circuit breaker trip..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 text-slate-800 leading-relaxed"
                />
              </div>

              {/* 4 Bullet Highlights */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Key Service Checkpoints / Bullets (with Red Checkmarks)
                  </label>
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {highlightsList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <Check className="w-4 h-4 text-red-600 shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateHighlight(idx, e.target.value)}
                        placeholder={`Bullet #${idx + 1}`}
                        className="w-full text-xs bg-transparent border-0 focus:outline-none text-slate-900 font-semibold"
                      />
                      {highlightsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHighlight(idx)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action Buttons Editor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Red Primary Button Text</label>
                  <input
                    type="text"
                    value={aboutSettings.aboutBookBtnText || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, aboutBookBtnText: e.target.value })}
                    placeholder="Book a Service with Sanjit"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-red-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Phone Call Button Number</label>
                  <input
                    type="text"
                    value={aboutSettings.phone || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, phone: e.target.value })}
                    placeholder="+977 9825870047"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingAbout}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {savingAbout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{savingAbout ? 'Saving Changes...' : 'Save & Publish to Homepage'}</span>
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* SECTION RE-ORDERING & TOGGLE LIST */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600" />
              <span>All Homepage Sections & Order</span>
            </h2>
            <p className="text-xs text-slate-500">
              Drag or use Up/Down arrows to reorder sections. Toggle Visible to hide/show on homepage.
            </p>
          </div>

          <button
            onClick={handleSaveLayout}
            disabled={savingLayout}
            className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            {savingLayout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Section Ordering</span>
          </button>
        </div>

        {savedLayoutMessage && (
          <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Homepage section ordering updated successfully!</span>
          </div>
        )}

        {errorLayoutMessage && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorLayoutMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
          {sections.map((sec, idx) => {
            const isAboutSection = sec.sectionKey === 'about' || sec.sectionKey === 'about_snippet';

            return (
              <div
                key={sec.id || sec.sectionKey}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isAboutSection ? 'bg-red-50/30 border-l-4 border-l-red-600' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{sec.label}</span>
                      {isAboutSection && (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                          Edited in Form Above
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Key: {sec.sectionKey}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Direct Edit Links for each section */}
                  {isAboutSection ? (
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content (Above)</span>
                    </button>
                  ) : sec.sectionKey === 'hero' ? (
                    <Link
                      href="/admin/hero"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Slides</span>
                    </Link>
                  ) : sec.sectionKey === 'services' ? (
                    <Link
                      href="/admin/services"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Services</span>
                    </Link>
                  ) : sec.sectionKey === 'testimonials' ? (
                    <Link
                      href="/admin/testimonials"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageSquareQuote className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Reviews</span>
                    </Link>
                  ) : sec.sectionKey === 'faq' ? (
                    <Link
                      href="/admin/faq"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit FAQs</span>
                    </Link>
                  ) : sec.sectionKey === 'blog' ? (
                    <Link
                      href="/admin/blog"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Blog</span>
                    </Link>
                  ) : null}

                  {/* Toggle Visible */}
                  <button
                    type="button"
                    onClick={() => toggleSection(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
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
                      type="button"
                      onClick={() => moveSection(idx, 'UP')}
                      disabled={idx === 0}
                      className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
