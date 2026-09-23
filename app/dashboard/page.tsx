'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Clock,
  MapPin,
  CalendarCheck,
  Phone,
  MessageSquare,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { auth, signOut } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { StatusBadge, UrgencyBadge } from '@/components/admin/StatusBadge';

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
  googleMapsUrl?: string | null;
  createdAt: string;
}

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      try {
        const res = await fetch(`/api/requests?userId=${currentUser.uid}`);
        const data = await res.json();
        if (data.success) {
          setRequests(data.requests || []);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 space-y-8">
        {/* Top Profile Banner */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome, {user?.displayName || 'Customer'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        {/* Requests List */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Your Service Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track appointments and status updates from Sanjeet Mishra
              </p>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-200">
              {requests.length} Total Bookings
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                You haven't placed any electrical service requests yet.
              </p>
              <Link
                href="/request-service"
                className="btn-primary inline-flex items-center text-xs"
              >
                Request Your First Service
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                        {req.requestId}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">
                        {req.serviceName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge urgency={req.urgency} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      <span>
                        {req.address}
                        {req.area ? `, ${req.area}` : ''}, {req.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span>
                        Placed on {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      {req.googleMapsUrl && (
                        <a
                          href={req.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Map Location</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
