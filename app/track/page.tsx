'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  Loader2,
  User,
  Zap,
  Sparkles
} from 'lucide-react';

interface ServiceRequestData {
  id: string;
  requestId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  preferredContact: string;
  serviceName: string;
  urgency: string;
  preferredDate: string | null;
  preferredTime: string | null;
  description: string;
  address: string;
  area: string | null;
  city: string;
  status: string;
  internalNotes: string | null;
  adminAssigned: string | null;
  createdAt: string;
  updatedAt: string;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || searchParams.get('id') || '';

  const [searchCode, setSearchCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<ServiceRequestData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRequestDetails = async (codeToSearch: string) => {
    const cleanCode = codeToSearch.trim();
    if (!cleanCode) return;

    setLoading(true);
    setErrorMessage(null);
    setRequest(null);

    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (res.ok && data.success && data.request) {
        setRequest(data.request);
      } else {
        setErrorMessage(data.message || `No service request found for code "${cleanCode}". Please check your Request ID.`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage('Failed to look up request. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchRequestDetails(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      fetchRequestDetails(searchCode);
    }
  };

  // Status mapping
  const steps = [
    {
      key: 'NEW',
      title: 'Request Received',
      description: 'Logged in VoltixNepal dispatch system',
      icon: Clock,
    },
    {
      key: 'CONFIRMED',
      title: 'Order Confirmed',
      description: 'Technician review & schedule verified',
      icon: CheckCircle2,
    },
    {
      key: 'IN_PROGRESS',
      title: 'Technician Dispatched',
      description: 'Electrician on-site / executing work',
      icon: Wrench,
    },
    {
      key: 'COMPLETED',
      title: 'Completed & Certified',
      description: 'Testing complete, safety verified',
      icon: ShieldCheck,
    },
  ];

  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case 'NEW':
        return 0;
      case 'CONTACTED':
      case 'CONFIRMED':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'COMPLETED':
        return 3;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIndex = request ? getActiveStepIndex(request.status) : 0;
  const isCancelled = request?.status === 'CANCELLED';

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Track Your <span className="text-red-600">Service Request</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Enter your Request ID (e.g. <span className="font-mono font-bold text-slate-800">VN-2026-000001</span>) sent to your email to track technician assignment and work status in real-time.
          </p>
        </div>

        {/* Search Bar Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Request ID (e.g. VN-2026-000001)..."
                className="w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 uppercase"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Track Order</span>
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Request Tracking Result */}
        {request && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Status Stepper Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Service Order Details
                  </span>
                  <h2 className="text-xl font-black text-slate-900 font-mono flex items-center gap-2 mt-0.5">
                    <span>{request.requestId}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-bold ${
                        request.urgency === 'EMERGENCY'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : request.urgency === 'URGENT'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {request.urgency}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Submitted: {new Date(request.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              {isCancelled ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center">
                  This service request was marked as CANCELLED.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                  {steps.map((step, idx) => {
                    const isPassed = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const IconComponent = step.icon;

                    return (
                      <div
                        key={step.key}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-red-50/80 border-red-300 ring-2 ring-red-600/20'
                            : isPassed
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50/50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCurrent
                                ? 'bg-red-600 text-white shadow-md'
                                : isPassed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-red-700' : isPassed ? 'text-emerald-800' : 'text-slate-600'
                            }`}
                          >
                            Step {idx + 1}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Live Assigned Technician & Progress Notes Banner */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <User className="w-4 h-4 text-red-600" />
                    <span>Assigned Electrician:</span>
                    <span className="text-slate-900 font-extrabold bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {request.adminAssigned || 'Sanjit Mishra (Lead Electrician & Proprietor)'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Status: <strong className="text-red-600 uppercase">{request.status}</strong>
                  </div>
                </div>

                {request.internalNotes && (
                  <div className="pt-2 border-t border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-700">Technician Dispatch Update: </span>
                    <span className="text-slate-600">{request.internalNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Job & Location Breakdown</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Customer Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{request.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Service Category:</span>
                  <span className="font-bold text-slate-900 text-sm">{request.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{request.address}{request.area ? `, ${request.area}` : ''}, {request.city}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Method:</span>
                  <span className="font-semibold text-slate-800 uppercase">{request.preferredContact} ({request.customerPhone})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 block mb-1">Issue Description:</span>
                <p className="p-3 rounded-lg bg-slate-50 text-slate-700 leading-relaxed font-normal">
                  {request.description}
                </p>
              </div>

              {/* Direct Action Contact Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://wa.me/9779825870047?text=${encodeURIComponent(
                    `Hello Sanjit, I am tracking my service request #${request.requestId} for ${request.serviceName}. Could you please share an arrival update?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp for Live Arrival Update</span>
                </a>

                <a
                  href="tel:+9779825870047"
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-red-500" />
                  <span>Call Sanjit Mishra</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
