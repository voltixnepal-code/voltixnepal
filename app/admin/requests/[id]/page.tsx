'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  Navigation,
  ExternalLink,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  ScanSearch,
} from 'lucide-react';
import { StatusBadge, UrgencyBadge } from '@/components/admin/StatusBadge';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [request, setRequest] = useState<any>(null);
  const [status, setStatus] = useState('NEW');
  const [internalNotes, setInternalNotes] = useState('');
  const [adminAssigned, setAdminAssigned] = useState('Sanjit Mishra');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const router = useRouter();

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/requests/${params.id}`);
      if (res.ok && res.data?.success && res.data?.request) {
        setRequest(res.data.request);
        setStatus(res.data.request.status);
        setInternalNotes(res.data.request.internalNotes || '');
        setAdminAssigned(res.data.request.adminAssigned || 'Sanjit Mishra');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await adminFetch(`/api/requests/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          internalNotes,
          adminAssigned,
        }),
      });

      if (res.ok && res.data?.success) {
        setRequest(res.data.request);
        setStatusMsg('Request updated successfully.');
      } else {
        throw new Error(res.error || 'Failed to update request.');
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service request?')) return;
    try {
      const res = await adminFetch(`/api/requests/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok && res.data?.success) {
        router.push('/admin/requests');
      } else {
        alert(res.error || 'Failed to delete request.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading request details...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900">Request Not Found</h2>
        <Link href="/admin/requests" className="btn-secondary text-xs">
          Back to All Requests
        </Link>
      </div>
    );
  }

  const mapLink =
    request.googleMapsUrl ||
    (request.latitude && request.longitude
      ? `https://www.google.com/maps?q=${request.latitude},${request.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${request.address}, ${request.city}`
        )}`);

  const directionsLink =
    request.latitude && request.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${request.address}, ${request.city}`
        )}`;

  // Direct WhatsApp link to the customer
  const customerWhatsAppNumber = request.customerPhone.replace(/[^0-9]/g, '');
  const customerWhatsAppLink = `https://wa.me/${customerWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${request.customerName}, this is Sanjit Mishra from VoltixNepal regarding your electrical service request #${request.requestId}.`
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Requests</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/track?code=${request?.requestId}`}
            target="_blank"
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            <span>Preview Tracking</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={handleDelete}
            className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-md text-xs flex items-center gap-2 ${
            statusMsg.startsWith('Error')
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {statusMsg.startsWith('Error') ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Grid: Request Content & Dispatch Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (8 cols): Information & Location */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                    {request.requestId}
                  </span>
                  <UrgencyBadge urgency={request.urgency} />
                  <StatusBadge status={request.status} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-2">
                  {request.serviceName}
                </h1>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div>Received on</div>
                <div className="font-semibold text-slate-700">
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Problem / Requirement Description
              </h2>
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                {request.description}
              </div>
            </div>

            {request.additionalNotes && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Customer Notes
                </h3>
                <p className="text-xs text-slate-700 italic">
                  "{request.additionalNotes}"
                </p>
              </div>
            )}
          </div>

          {/* Location & Maps Actions */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Customer Address & Coordinates</span>
              </h3>
              {request.latitude && request.longitude && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  GPS: {request.latitude.toFixed(4)}, {request.longitude.toFixed(4)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Full Street Address</span>
                <span className="font-bold text-slate-900 text-sm">{request.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Area / City</span>
                <span className="font-semibold text-slate-800">
                  {request.area ? `${request.area}, ` : ''}{request.city}
                </span>
              </div>
            </div>

            {/* Map Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={directionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right (4 cols): Dispatch & Status Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Contact Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Customer Contact
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {request.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Prefers {request.preferredContact}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`tel:${request.customerPhone}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>Call {request.customerPhone}</span>
                </a>

                <a
                  href={customerWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>Open WhatsApp Chat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {request.customerEmail && (
                  <a
                    href={`mailto:${request.customerEmail}?subject=VoltixNepal%20Service%20Request%20%23${request.requestId}`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Send Direct Email</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Status & Assignment Box */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Update Request Status
            </h3>

            <div className="space-y-3">
              <div>
                <label className="form-label text-xs">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-input text-xs bg-white font-semibold"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Assigned Technician</label>
                <input
                  type="text"
                  value={adminAssigned}
                  onChange={(e) => setAdminAssigned(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Internal Notes</label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Visited site at 10 AM, identified loose neutral terminal, quoted Rs. 800..."
                  className="form-input text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
