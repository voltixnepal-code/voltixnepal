import React from 'react';
import { Repeat, Sparkles, Crown, UserCheck } from 'lucide-react';

interface CustomerLoyaltyBadgeProps {
  count?: number;
  className?: string;
  showText?: boolean;
}

export function CustomerLoyaltyBadge({
  count = 1,
  className = '',
  showText = true,
}: CustomerLoyaltyBadgeProps) {
  const safeCount = Math.max(1, count || 1);

  if (safeCount === 1) {
    return (
      <span
        title="1st Booking (New Customer)"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
      >
        <span className="font-extrabold text-slate-800">x1</span>
        {showText && <span className="text-[9px] text-slate-500 font-medium">New</span>}
      </span>
    );
  }

  if (safeCount === 2) {
    return (
      <span
        title="2nd Booking (Returning Customer)"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs ${className}`}
      >
        <Repeat className="w-2.5 h-2.5 text-blue-600 shrink-0" />
        <span className="font-extrabold text-blue-700">x2</span>
        {showText && <span className="text-[9px] text-blue-600 font-semibold">Returning</span>}
      </span>
    );
  }

  if (safeCount === 3) {
    return (
      <span
        title="3rd Booking (Loyal Customer)"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${className}`}
      >
        <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
        <span className="font-extrabold text-amber-800">x3</span>
        {showText && <span className="text-[9px] text-amber-700 font-bold">Loyal Client</span>}
      </span>
    );
  }

  // 4+ VIP Client
  return (
    <span
      title={`${safeCount} Bookings (VIP Regular Client)`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 border border-purple-300 shadow-2xs ${className}`}
    >
      <Crown className="w-2.5 h-2.5 text-purple-600 shrink-0" />
      <span className="font-extrabold text-purple-900">x{safeCount}</span>
      {showText && <span className="text-[9px] text-purple-700 font-bold">VIP Regular</span>}
    </span>
  );
}

export function PaymentBadge({
  status = 'UNPAID',
  amount = 0,
  method = 'CASH',
}: {
  status?: string;
  amount?: number;
  method?: string | null;
}) {
  const formattedAmount = (amount || 0).toLocaleString('en-IN');

  if (status === 'PAID') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span>Rs. {formattedAmount}</span>
        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold">
          Paid ({method || 'Cash'})
        </span>
      </span>
    );
  }

  if (status === 'PARTIAL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
        <span>Rs. {formattedAmount}</span>
        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold">
          Partial Paid
        </span>
      </span>
    );
  }

  if (amount > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
        <span>Rs. {formattedAmount}</span>
        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-red-100 text-red-800 font-extrabold">
          Unpaid
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      Quote Pending
    </span>
  );
}
