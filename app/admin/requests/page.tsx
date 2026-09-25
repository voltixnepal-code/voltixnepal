'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Phone,
  MessageSquare,
  ExternalLink,
  Calendar,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { StatusBadge, UrgencyBadge } from '@/components/admin/StatusBadge';
import { CustomerLoyaltyBadge, PaymentBadge } from '@/components/admin/CustomerLoyaltyBadge';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (urgencyFilter !== 'ALL') params.set('urgency', urgencyFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/requests?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Service Requests & Billing Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View orders, customer repeat history (x1, x2, x3...), payments, and technician dispatch
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, request ID, or address..."
              className="form-input pl-9 text-xs"
            />
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input text-xs py-2 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New (Unreviewed)</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Urgency:
            </span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="form-input text-xs py-2 bg-white"
            >
              <option value="ALL">All Urgencies</option>
              <option value="NORMAL">Standard</option>
              <option value="URGENT">Urgent (Today)</option>
              <option value="EMERGENCY">Emergency (Immediate)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading service requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              No matching service requests found
            </p>
            <p className="text-xs text-slate-500">
              Try adjusting your search filters or status criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Customer & History</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Billing & Payment</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                      {req.requestId}
                      <div className="mt-1">
                        <UrgencyBadge urgency={req.urgency} />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          {req.customerName}
                        </span>
                        {/* Repeat Customer Work Multiplier Badge */}
                        <CustomerLoyaltyBadge count={req.customerRequestCount} />
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${req.customerPhone}`}
                          className="hover:text-red-600"
                        >
                          {req.customerPhone}
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {req.serviceName}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                        {req.description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <PaymentBadge
                        status={req.paymentStatus}
                        amount={req.paidAmount || req.billedAmount}
                        method={req.paymentMethod}
                      />
                      {req.billedAmount > 0 && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Billed: Rs. {Number(req.billedAmount).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">
                        {req.address}
                        {req.area ? `, ${req.area}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {req.city}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="btn-secondary text-[11px] py-1 px-3 font-semibold hover:bg-slate-100"
                      >
                        Manage & Bill
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
