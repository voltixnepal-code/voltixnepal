'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Wrench,
  ArrowRight,
  ExternalLink,
  Phone,
  MessageSquare,
  MapPin,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  Wallet,
  Receipt,
} from 'lucide-react';
import { StatusBadge, UrgencyBadge } from '@/components/admin/StatusBadge';
import { CustomerLoyaltyBadge, PaymentBadge } from '@/components/admin/CustomerLoyaltyBadge';

export default function AdminDashboardOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-xs">
        Loading dashboard metrics...
      </div>
    );
  }

  const stats = data?.stats || {};
  const earnings = data?.earnings || {};
  const recentRequests = data?.recentRequests || [];
  const recentAudit = data?.recentAuditLogs || [];

  const formatNpr = (val: number) => `Rs. ${(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Electrical Operations & Revenue Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of earnings, service requests, and customer repeat bookings
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Financial Revenue & Earnings Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Earnings & Revenue Performance
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Nepali Rupee (NPR / Rs.)
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Earnings */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-5 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Today's Earnings</span>
              <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {formatNpr(earnings.dailyEarnings)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span>{earnings.todayPaidCount || 0} collections today</span>
            </div>
          </div>

          {/* Weekly Earnings */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-5 rounded-xl border border-blue-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">Weekly Earnings</span>
              <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {formatNpr(earnings.weeklyEarnings)}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">
              Current Week Collections
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-5 rounded-xl border border-purple-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">Monthly Earnings</span>
              <div className="p-2 rounded-lg bg-purple-600 text-white shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {formatNpr(earnings.monthlyEarnings)}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">
              This Month ({earnings.monthPaidCount || 0} jobs paid)
            </div>
          </div>

          {/* Total Lifetime Earnings */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Total Lifetime Earnings</span>
              <div className="p-2 rounded-lg bg-red-600 text-white shadow-xs">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {formatNpr(earnings.totalEarnings)}
            </div>
            <div className="text-[11px] text-amber-300 font-medium mt-1">
              Pending Receivable: {formatNpr(earnings.pendingReceivable)}
            </div>
          </div>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Inquiries
            </span>
            <div className="p-2 rounded bg-slate-100 text-slate-700">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats.totalRequests || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.todayRequests || 0} received today
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-red-200 shadow-2xs bg-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700">New Requests</span>
            <div className="p-2 rounded bg-red-100 text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">
            {stats.newRequests || 0}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            Requires initial review / contact
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">
              In Progress / Confirmed
            </span>
            <div className="p-2 rounded bg-blue-100 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {(stats.confirmedRequests || 0) + (stats.inProgressRequests || 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.inProgressRequests || 0} actively on-site
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">
              Completed Jobs
            </span>
            <div className="p-2 rounded bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats.completedRequests || 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Successfully resolved
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Inquiries + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Service Requests (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Service Requests & Billing
              </h2>
              <p className="text-xs text-slate-500">
                Customer submissions with loyalty history (x1, x2, x3...) & payment tracking
              </p>
            </div>
            <Link
              href="/admin/requests"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No service requests found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRequests.map((req: any) => (
                <div
                  key={req.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {req.requestId}
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {req.customerName}
                      </span>
                      {/* Repeat Work Multiplier Badge (e.g. x1, x2, x3...) */}
                      <CustomerLoyaltyBadge count={req.customerRequestCount} />
                      <UrgencyBadge urgency={req.urgency} />
                    </div>

                    <div className="text-xs text-slate-700 font-medium flex items-center gap-2">
                      <span>{req.serviceName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {req.address}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {req.customerPhone}
                      </span>
                      <span>•</span>
                      {/* Customer Payment Status */}
                      <PaymentBadge
                        status={req.paymentStatus}
                        amount={req.paidAmount || req.billedAmount}
                        method={req.paymentMethod}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={req.status} />
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className="btn-secondary text-xs py-1.5 px-3 font-semibold hover:bg-slate-100"
                    >
                      Manage & Bill
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tools & Audit (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fast Navigation */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Management Shortcuts
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/gallery"
                className="flex items-center justify-between p-2.5 rounded-md bg-red-50 hover:bg-red-100 font-bold text-red-700 transition-colors border border-red-200"
              >
                <span>Upload Daily Work Photo/Video (Gallery)</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600" />
              </Link>
              <Link
                href="/admin/services"
                className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 transition-colors"
              >
                <span>Edit Electrical Services & Rates</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/admin/hero"
                className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 transition-colors"
              >
                <span>Manage 5 Hero Banner Slides</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 transition-colors"
              >
                <span>Change Phone & WhatsApp Number</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/admin/blog"
                className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 transition-colors"
              >
                <span>Publish Safety Guide Article</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Recent Audit Log Activity */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Recent System Activity
            </h3>
            {recentAudit.length === 0 ? (
              <p className="text-xs text-slate-400">No logs recorded yet.</p>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-600">
                {recentAudit.map((log: any) => (
                  <div key={log.id} className="pb-2 border-b border-slate-50 last:border-0">
                    <div className="font-semibold text-slate-800">
                      {log.action}
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between mt-0.5">
                      <span>{log.details || log.entityType}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
