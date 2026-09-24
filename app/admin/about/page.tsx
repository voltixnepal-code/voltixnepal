'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Award,
  Clock,
  Building,
  Target,
  Eye,
  FileText,
  Phone,
  RefreshCw
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminAboutCMSPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload progress states
  const [ownerPhotoUploading, setOwnerPhotoUploading] = useState(false);
  const [coverPhotoUploading, setCoverPhotoUploading] = useState(false);

  const ownerFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    businessName: 'VoltixNepal',
    ownerName: 'Sanjit Mishra',
    tagline: 'Professional Electrical Services in Nepal',
    phone: '+977 9825870047',
    aboutTitle: 'Reliable Electrical Workmanship with Safety at the Core',
    aboutSubtitle: 'Standardized safety, transparent diagnostics, and punctual technician dispatch across Kathmandu Valley.',
    aboutStory: 'VoltixNepal was founded by Sanjit Mishra to address a persistent issue in Kathmandu Valley electrical contracting: the lack of standardized safety, transparent diagnostics, and punctual technician dispatch.',
    aboutMission: 'Protecting lives, eliminating electrical fire hazards, and ensuring electrical installations function safely without voltage fluctuations or insulation failure.',
    aboutVision: "To be Nepal's most trusted and technologically advanced electrical contracting and safety engineering team.",
    aboutOwnerTitle: 'Lead Electrician & Proprietor',
    aboutOwnerBio: 'Certified lead electrician with over 10 years of extensive experience delivering residential wiring, commercial automation, and rapid emergency troubleshooting across Nepal.',
    aboutOwnerPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    aboutCoverPhoto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    aboutExperienceYears: 10,
    aboutProjectsDone: 1500,
    aboutHappyClients: 1200,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setForm((prev) => ({
            ...prev,
            ...data.settings,
            aboutTitle: data.settings.aboutTitle || prev.aboutTitle,
            aboutSubtitle: data.settings.aboutSubtitle || prev.aboutSubtitle,
            aboutStory: data.settings.aboutStory || prev.aboutStory,
            aboutMission: data.settings.aboutMission || prev.aboutMission,
            aboutVision: data.settings.aboutVision || prev.aboutVision,
            aboutOwnerTitle: data.settings.aboutOwnerTitle || prev.aboutOwnerTitle,
            aboutOwnerBio: data.settings.aboutOwnerBio || prev.aboutOwnerBio,
            aboutOwnerPhoto: data.settings.aboutOwnerPhoto || prev.aboutOwnerPhoto,
            aboutCoverPhoto: data.settings.aboutCoverPhoto || prev.aboutCoverPhoto,
            aboutExperienceYears: data.settings.aboutExperienceYears ?? prev.aboutExperienceYears,
            aboutProjectsDone: data.settings.aboutProjectsDone ?? prev.aboutProjectsDone,
            aboutHappyClients: data.settings.aboutHappyClients ?? prev.aboutHappyClients,
          }));
        }
      } catch (err) {
        console.error('Failed to load About settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'aboutOwnerPhoto' | 'aboutCoverPhoto',
    setUploadingState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 95 * 1024 * 1024) {
      alert('Photo must be less than 95MB.');
      return;
    }

    try {
      setUploadingState(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'voltixnepal/about');

      const res = await adminFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = res.data || {};
      if (res.ok && data.success) {
        const uploadedUrl = data.secure_url || data.url;
        setForm((prev) => ({ ...prev, [field]: uploadedUrl }));
      } else {
        throw new Error(res.error || data.error || 'Failed to upload image to Cloudinary.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Image upload failed. You can also paste an image URL directly.');
    } finally {
      setUploadingState(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      const data = res.data || {};
      if (res.ok && data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        throw new Error(res.error || data.message || 'Failed to update About Us settings.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Loading About Us CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">About Us CMS & Profile</h1>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
              Live Website CMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize the About page text, owner profile photos, mission, vision, and company achievements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/about"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Live Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>About Us content and photos have been updated successfully! Changes are live on the website.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Proprietor / Lead Electrician Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Lead Electrician & Proprietor Profile</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Owner Photo Uploader */}
            <div className="lg:col-span-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Proprietor Photo (Cloudinary)
              </label>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] group shadow-inner">
                {form.aboutOwnerPhoto ? (
                  <img
                    src={form.aboutOwnerPhoto}
                    alt={form.ownerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <User className="w-12 h-12" />
                    <span className="text-[11px] mt-1">No Photo Uploaded</span>
                  </div>
                )}

                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4">
                  <button
                    type="button"
                    onClick={() => ownerFileInputRef.current?.click()}
                    disabled={ownerPhotoUploading}
                    className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    {ownerPhotoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Upload className="w-3.5 h-3.5 text-red-600" />}
                    <span>{ownerPhotoUploading ? 'Uploading...' : 'Replace Photo'}</span>
                  </button>
                  <span className="text-[10px] text-slate-200 text-center">Auto-compressed on Cloudinary</span>
                </div>
              </div>

              <input
                ref={ownerFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'aboutOwnerPhoto', setOwnerPhotoUploading)}
                className="hidden"
              />

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500 font-medium">
                  Direct Photo URL
                </label>
                <input
                  type="url"
                  value={form.aboutOwnerPhoto || ''}
                  onChange={(e) => setForm({ ...form, aboutOwnerPhoto: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>
            </div>

            {/* Profile Fields */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Owner / Electrician Name</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Job Title / Designation</label>
                <input
                  type="text"
                  value={form.aboutOwnerTitle || ''}
                  onChange={(e) => setForm({ ...form, aboutOwnerTitle: e.target.value })}
                  placeholder="Lead Electrician & Proprietor"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Professional Bio & Experience Summary</label>
                <textarea
                  rows={3}
                  value={form.aboutOwnerBio || ''}
                  onChange={(e) => setForm({ ...form, aboutOwnerBio: e.target.value })}
                  placeholder="Certified lead electrician with over 10 years of experience..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              {/* Stats Counters */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>Years of Experience</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.aboutExperienceYears ?? 10}
                  onChange={(e) => setForm({ ...form, aboutExperienceYears: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Projects Completed</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.aboutProjectsDone ?? 1500}
                  onChange={(e) => setForm({ ...form, aboutProjectsDone: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: About Story, Mission & Vision */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Target className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">About Page Content, Mission & Vision</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Main Headline Title</label>
                <input
                  type="text"
                  value={form.aboutTitle || ''}
                  onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })}
                  placeholder="Reliable Electrical Workmanship with Safety at the Core"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Headline Tagline / Subtitle</label>
                <input
                  type="text"
                  value={form.aboutSubtitle || ''}
                  onChange={(e) => setForm({ ...form, aboutSubtitle: e.target.value })}
                  placeholder="Standardized safety, transparent diagnostics, and punctual technician dispatch..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Founding Story & Background</label>
              <textarea
                rows={4}
                value={form.aboutStory || ''}
                onChange={(e) => setForm({ ...form, aboutStory: e.target.value })}
                placeholder="VoltixNepal was founded by Sanjit Mishra to address a persistent issue in Kathmandu Valley..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Our Mission Statement</label>
                <textarea
                  rows={3}
                  value={form.aboutMission || ''}
                  onChange={(e) => setForm({ ...form, aboutMission: e.target.value })}
                  placeholder="Protecting lives, eliminating fire hazards, and ensuring home appliances function safely..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Our Long-Term Vision</label>
                <textarea
                  rows={3}
                  value={form.aboutVision || ''}
                  onChange={(e) => setForm({ ...form, aboutVision: e.target.value })}
                  placeholder="To be Nepal's leading safety-first electrical service engineering firm..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Workshop / Cover Photo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">About Page Banner / Workshop Photo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9] group shadow-inner">
              {form.aboutCoverPhoto ? (
                <img
                  src={form.aboutCoverPhoto}
                  alt="Workshop Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-[11px] mt-1">No Cover Photo</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  disabled={coverPhotoUploading}
                  className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  {coverPhotoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Upload className="w-3.5 h-3.5 text-red-600" />}
                  <span>{coverPhotoUploading ? 'Uploading...' : 'Replace Cover'}</span>
                </button>
              </div>
            </div>

            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'aboutCoverPhoto', setCoverPhotoUploading)}
              className="hidden"
            />

            <div className="sm:col-span-7 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Cover / Workshop Photo URL</label>
                <input
                  type="url"
                  value={form.aboutCoverPhoto || ''}
                  onChange={(e) => setForm({ ...form, aboutCoverPhoto: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Upload a high-quality photo of electrical equipment, workshop testing tools, or completed on-site project panel. Max file size: 95MB.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
