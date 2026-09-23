'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Loader2,
  CheckCircle2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  Globe,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    businessName: 'VoltixNepal',
    ownerName: 'Sanjeet Mishra',
    tagline: 'Professional Electrical Services in Nepal',
    phone: '+977 9800000000',
    whatsappNumber: '9779800000000',
    email: 'sanjeet@voltixnepal.com',
    address: 'Kathmandu, Bagmati Province, Nepal',
    businessHours:
      'Sunday - Friday: 7:00 AM - 8:00 PM | Saturday: Emergency Only',
    emergencyAvailable: true,
    emergencyPhone: '+977 9800000000',
    googleMapsUrl: 'https://maps.google.com/?q=Kathmandu,Nepal',
    footerText:
      'Professional electrical installation, emergency repair, and maintenance services across Kathmandu Valley. Safety, punctuality, and quality guaranteed by Sanjeet Mishra.',
    announcementText:
      '24/7 Emergency Electrical Breakdown Service Active in Kathmandu Valley',
    announcementActive: true,
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    youtubeUrl: 'https://youtube.com',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Website & Business Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure WhatsApp order destination, contact numbers, hours, and branding
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
          <span>Save Settings</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Business settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Core Business Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Core Business Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Business Name</label>
              <input
                type="text"
                required
                value={settings.businessName}
                onChange={(e) =>
                  setSettings({ ...settings, businessName: e.target.value })
                }
                className="form-input text-xs font-semibold"
              />
            </div>

            <div>
              <label className="form-label text-xs">Electrician / Owner Name</label>
              <input
                type="text"
                required
                value={settings.ownerName}
                onChange={(e) =>
                  setSettings({ ...settings, ownerName: e.target.value })
                }
                className="form-input text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Tagline / Subheading</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                setSettings({ ...settings, tagline: e.target.value })
              }
              className="form-input text-xs"
            />
          </div>
        </div>

        {/* 2. Contact & Dispatch Numbers */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Dispatch & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">
                WhatsApp Business Number (Country Code + digits)
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappNumber: e.target.value })
                  }
                  placeholder="9779800000000"
                  className="form-input text-xs pl-9 font-mono font-bold text-emerald-800"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                All customer orders on WhatsApp will be routed to this exact number.
              </span>
            </div>

            <div>
              <label className="form-label text-xs">Primary Phone Number (Click to Call)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  placeholder="+977 9800000000"
                  className="form-input text-xs pl-9 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Business Admin Email (Order Alerts)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  placeholder="sanjeet@voltixnepal.com"
                  className="form-input text-xs pl-9"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs">Emergency Phone Line</label>
              <input
                type="text"
                value={settings.emergencyPhone || ''}
                onChange={(e) =>
                  setSettings({ ...settings, emergencyPhone: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Operating Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">Working Hours Text</label>
              <input
                type="text"
                value={settings.businessHours}
                onChange={(e) =>
                  setSettings({ ...settings, businessHours: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Emergency Banner & Footer */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Announcement Banner & Footer Note
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcementActive}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementActive: e.target.checked,
                  })
                }
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="font-semibold text-slate-800">
                Show Top Alert Ribbon on Website
              </span>
            </label>

            <div>
              <label className="form-label text-xs">Announcement Text</label>
              <input
                type="text"
                value={settings.announcementText || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementText: e.target.value,
                  })
                }
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">Footer About Paragraph</label>
              <textarea
                rows={2}
                value={settings.footerText}
                onChange={(e) =>
                  setSettings({ ...settings, footerText: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Social Media Links */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Social Media Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Facebook Page URL</label>
              <input
                type="url"
                value={settings.facebookUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, facebookUrl: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">Instagram Profile URL</label>
              <input
                type="url"
                value={settings.instagramUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, instagramUrl: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">TikTok Profile URL</label>
              <input
                type="url"
                value={settings.tiktokUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, tiktokUrl: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">YouTube Channel URL</label>
              <input
                type="url"
                value={settings.youtubeUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, youtubeUrl: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-3 px-6 font-bold flex items-center gap-2 shadow-md"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
