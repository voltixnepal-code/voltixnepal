'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  User,
  Wrench,
  ScanSearch,
  Copy,
  Check,
} from 'lucide-react';
import { StatusBadge, UrgencyBadge } from '@/components/admin/StatusBadge';

const STEPS = [
  { key: 'NEW',         label: 'Request Received',      desc: 'Logged in VoltixNepal dispatch system' },
  { key: 'CONFIRMED',   label: 'Order Confirmed',        desc: 'Technician review & schedule verified' },
  { key: 'IN_PROGRESS', label: 'Technician Dispatched',  desc: 'Electrician on-site / executing work' },
  { key: 'COMPLETED',   label: 'Completed & Certified',  desc: 'Testing complete, safety verified' },
];

function getActiveStepIndex(status: string) {
  switch (status) {
    case 'NEW':         return 0;
    case 'CONTACTED':   return 0;
    case 'CONFIRMED':   return 1;
    case 'IN_PROGRESS': return 2;
    case 'COMPLETED':   return 3;
    case 'CANCELLED':   return -1;
    default:            return 0;
  }
}

export default function AdminTrackPreviewPage() {
  const [requests, setRequests]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [selected, setSelected]   = useState<any>(null);
  const [copied, setCopied]       = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/requests?limit=50');
      const data = await res.json();
      if (data.success) setRequests(data.requests || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter((r) => {
    const q = searchCode.toLowerCase();
    return (
      r.requestId?.toLowerCase().includes(q) ||
      r.customerName?.toLowerCase().includes(q) ||
      r.customerPhone?.includes(q)
    );
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const stepIndex = selected ? getActiveStepIndex(selected.status) : 0;
  const isCancelled = selected?.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ScanSearch className="w-6 h-6 text-red-600" />
            Track Order — Admin View
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search any service request and preview the tracking status exactly as the customer sees it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRequests} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/track"
            target="_blank"
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Track Page</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Search by Request ID, name, or phone..."
              className="form-input pl-9 text-xs w-full"
            />
          </div>

          {/* List */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading requests...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No matching requests found.</div>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                {filtered.map((req) => (
                  <li key={req.id}>
                    <button
                      onClick={() => setSelected(req)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${selected?.id === req.id ? 'bg-red-50 border-l-2 border-red-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-red-600">{req.requestId}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-0.5">{req.customerName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{req.serviceName} · {req.city}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Tracking Preview */}
        <div className="lg:col-span-7">
          {!selected ? (
            <div className="bg-white rounded-lg border border-dashed border-slate-300 h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <ScanSearch className="w-10 h-10" />
              <p className="text-sm font-medium">Select a request to preview its tracking page</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tracking Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {selected.requestId}
                      </span>
                      <UrgencyBadge urgency={selected.urgency} />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Submitted: {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selected.requestId)}
                      className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy ID'}
                    </button>
                    <Link
                      href={`/track?code=${selected.requestId}`}
                      target="_blank"
                      className="btn-primary text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Customer View
                    </Link>
                    <Link
                      href={`/admin/requests/${selected.id}`}
                      className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <Wrench className="w-3 h-3" />
                      Manage
                    </Link>
                  </div>
                </div>

                {/* Stepper */}
                <div className="px-6 py-5">
                  <div className="grid grid-cols-4 gap-2">
                    {STEPS.map((step, i) => {
                      const isActive   = i === stepIndex && !isCancelled;
                      const isDone     = i < stepIndex && !isCancelled;
                      const isFuture   = i > stepIndex || isCancelled;
                      return (
                        <div
                          key={step.key}
                          className={`rounded-xl p-3 border text-center transition-all ${
                            isActive
                              ? 'bg-red-50 border-red-300 shadow-sm'
                              : isDone
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-50'
                          }`}
                        >
                          <div className="flex justify-center mb-1.5">
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : isActive ? (
                              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">{i + 1}</span>
                              </div>
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <p className={`text-[10px] font-bold ${isActive ? 'text-red-700' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                            Step {i + 1}
                          </p>
                          <p className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-red-800' : isDone ? 'text-emerald-800' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          <p className={`text-[9px] mt-0.5 ${isActive ? 'text-red-600' : isDone ? 'text-emerald-600' : 'text-slate-300'}`}>
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {isCancelled && (
                    <div className="mt-3 text-center py-2 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
                      ⚠ This order has been CANCELLED
                    </div>
                  )}
                </div>

                {/* Customer & Service Info */}
                <div className="border-t border-slate-100 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer</p>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{selected.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${selected.customerPhone}`} className="text-slate-600 hover:text-red-600">{selected.customerPhone}</a>
                    </div>
                    {selected.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 truncate">{selected.customerEmail}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Service & Location</p>
                    <div className="flex items-start gap-2">
                      <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-800">{selected.serviceName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-600">{selected.address}{selected.area ? `, ${selected.area}` : ''}, {selected.city}</span>
                    </div>
                    {selected.adminAssigned && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">Assigned: <strong>{selected.adminAssigned}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
