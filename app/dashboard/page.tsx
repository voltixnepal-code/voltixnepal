'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Clock,
  MapPin,
  CalendarCheck,
  Calendar,
  Phone,
  MessageSquare,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Wrench,
  Navigation,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { auth, signOut } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { StatusBadge, UrgencyBadge } from '@/components/admin/StatusBadge';
import { PaymentBadge } from '@/components/admin/CustomerLoyaltyBadge';

interface CustomerRequest {
  id: string;
  requestId: string;
  serviceName: string;
  urgency: string;
  status: string;
  address: string;
  area?: string | null;
  city: string;
  description: string;
  additionalNotes?: string | null;
  googleMapsUrl?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  adminAssigned?: string | null;
  adminNotes?: string | null;
  rideStarted?: boolean;
  rideStartedAt?: string | null;
  billedAmount?: number | null;
  paidAmount?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paymentNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const router = useRouter();

  const fetchCustomerRequests = async (currentUser: FirebaseUser) => {
    try {
      const email = (currentUser.email || '').trim().toLowerCase();
      const phone = (currentUser.phoneNumber || '').replace(/\D/g, '').slice(-10);

      const queryParams = new URLSearchParams({
        userId: currentUser.uid,
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      });

      const res = await fetch(`/api/requests?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      const email = (currentUser.email || '').toLowerCase().trim();
      const adminEmails = [
        'voltixnepal@gmail.com',
        'bishaldev949@gmail.com',
        'info@voltixnepal.com',
      ];
      if (adminEmails.includes(email)) {
        router.push('/admin');
        return;
      }

      setUser(currentUser);
      fetchCustomerRequests(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-xs text-slate-500 font-medium">Loading your lifetime account history...</p>
      </div>
    );
  }

  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;
  const activeCount = requests.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  const filteredRequests = requests.filter((r) => {
    if (filterTab === 'ACTIVE') return r.status !== 'COMPLETED' && r.status !== 'CANCELLED';
    if (filterTab === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Profile Banner */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Welcome, {user?.displayName || 'Customer'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Customer</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/request-service"
              className="btn-primary text-xs font-bold flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book New Service</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Lifetime Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Lifetime Bookings
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {requests.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Permanently recorded on your account
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active / Scheduled
            </div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {activeCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              In progress or confirmed for service
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Services
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {completedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Full repair history and bills preserved
            </div>
          </div>
        </div>

        {/* Service Requests Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Tabs */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Your Service History & Bookings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every repair, invoice, assigned technician, and tracking link stays here for lifetime
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  filterTab === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({requests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('ACTIVE')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  filterTab === 'ACTIVE'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('COMPLETED')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  filterTab === 'COMPLETED'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>

          {/* Request List or Empty State */}
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {requests.length === 0
                    ? "You haven't placed any electrical service requests yet."
                    : 'No requests matching this tab.'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  When you book a service with your email or phone, your full order history, invoice, and technician records will appear here permanently.
                </p>
              </div>
              {requests.length === 0 && (
                <Link
                  href="/request-service"
                  className="btn-primary inline-flex items-center gap-1.5 text-xs"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Request Your First Service</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
                  {/* Top Bar: Request ID, Title, Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                          {req.requestId}
                        </span>
                        <StatusBadge status={req.status} />
                        <UrgencyBadge urgency={req.urgency} />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-1.5">
                        {req.serviceName}
                      </h3>
                    </div>

                    <div className="text-right text-xs text-slate-500 sm:shrink-0">
                      <div>Booked on</div>
                      <div className="font-semibold text-slate-700">
                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-3 leading-relaxed">
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">
                      Problem / Work Description:
                    </span>
                    {req.description}
                    {req.additionalNotes && (
                      <div className="text-slate-500 italic mt-1.5 border-t border-slate-200/60 pt-1.5">
                        Note: "{req.additionalNotes}"
                      </div>
                    )}
                  </div>

                  {/* Comprehensive Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* 1. Schedule & Appointment */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Appointment Schedule
                      </span>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-600" />
                        <span>{req.preferredDate || 'Standard Dispatch'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.preferredTime || 'Business Hours (9 AM - 6 PM)'}</span>
                      </div>
                    </div>

                    {/* 2. Technician & Live Dispatch Status */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Assigned Electrician
                      </span>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-red-600" />
                        <span>{req.adminAssigned || 'Sanjit Mishra (Lead Technician)'}</span>
                      </div>
                      <div className="text-[11px]">
                        {req.rideStarted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <Truck className="w-3 h-3 text-emerald-600 animate-bounce" />
                            <span>Technician Dispatched & En Route</span>
                          </span>
                        ) : req.status === 'COMPLETED' ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Service Completed Successfully</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Voltix Service Team Standby</span>
                        )}
                      </div>
                    </div>

                    {/* 3. Payment & Billing Details */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Billing & Receipt
                        </span>
                        <PaymentBadge
                          status={req.paymentStatus || 'UNPAID'}
                          amount={Number(req.paidAmount) || Number(req.billedAmount) || 0}
                          method={req.paymentMethod}
                        />
                      </div>
                      <div className="font-bold text-slate-900">
                        {req.billedAmount ? (
                          <span>Billed: Rs. {Number(req.billedAmount).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-slate-500 font-normal">Inspection / Quote</span>
                        )}
                      </div>
                      {req.paymentNotes && (
                        <div className="text-[10px] text-slate-500 truncate" title={req.paymentNotes}>
                          Ref: {req.paymentNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Footer Actions & Location */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>
                        {req.address}
                        {req.area ? `, ${req.area}` : ''}, {req.city}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {req.googleMapsUrl && (
                        <a
                          href={req.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-red-600" />
                          <span>Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <Link
                        href={`/track?id=${req.requestId}`}
                        className="btn-primary text-[11px] py-1 px-3 flex items-center gap-1.5 font-bold"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Live Track Order</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lifetime Data Guarantee Banner */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Lifetime History Guarantee:</strong> Your service requests, technician work logs, and payment receipts are preserved indefinitely on your Voltix Nepal customer account.
            </span>
          </div>
          <Link
            href="/contact"
            className="text-red-600 font-bold hover:underline shrink-0"
          >
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}
