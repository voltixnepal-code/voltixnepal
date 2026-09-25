'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  ClipboardList,
  RefreshCw,
  Wallet,
  ShieldCheck,
  User,
} from 'lucide-react';
import { CustomerLoyaltyBadge } from '@/components/admin/CustomerLoyaltyBadge';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/admin/customers${q}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer Directory & Loyalty
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered accounts, guest bookings, repeat client history (x1, x2, x3...), and lifetime spending
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, email, or phone..."
          className="form-input pl-9 text-xs"
        />
      </form>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading customer list...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No customer records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Customer Name & Loyalty</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Total Paid (Revenue)</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        {/* Repeat Customer Work Multiplier Badge */}
                        <CustomerLoyaltyBadge count={c.bookingCount} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="hover:text-red-600">
                          {c.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">
                        {c.bookingCount || 1} {c.bookingCount === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Rs. {(c.totalSpent || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.isRegistered ? (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          Registered Account
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          Direct Booking
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
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
