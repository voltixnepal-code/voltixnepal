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
        title="1st Booking"
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 whitespace-nowrap shrink-0 ${className}`}
      >
        x1
      </span>
    );
  }

  if (safeCount === 2) {
    return (
      <span
        title="2nd Booking (Returning Customer)"
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 whitespace-nowrap shrink-0 ${className}`}
      >
        <span>x2</span>
        {showText && <span className="text-[9px] font-medium text-blue-600">repeat</span>}
      </span>
    );
  }

  if (safeCount === 3) {
    return (
      <span
        title="3rd Booking (Loyal Customer)"
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 whitespace-nowrap shrink-0 ${className}`}
      >
        <span>x3</span>
        {showText && <span className="text-[9px] font-medium text-amber-700">loyal</span>}
      </span>
    );
  }

  // 4+ VIP Client - Compact, stable, single-line, professional
  return (
    <span
      title={`${safeCount} Bookings (VIP Customer)`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 whitespace-nowrap shrink-0 ${className}`}
    >
      <Crown className="w-2.5 h-2.5 text-purple-600 shrink-0" />
      <span>x{safeCount}</span>
      {showText && <span className="text-[9px] font-semibold text-purple-700">VIP</span>}
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
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
        <span>Rs. {formattedAmount}</span>
        <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
          Paid {method ? `(${method})` : ''}
        </span>
      </span>
    );
  }

  if (status === 'PARTIAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0">
        <span>Rs. {formattedAmount}</span>
        <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
          Partial
        </span>
      </span>
    );
  }

  if (amount > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap shrink-0">
        <span>Rs. {formattedAmount}</span>
        <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-red-100 text-red-800 font-bold">
          Unpaid
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap shrink-0">
      Quote Pending
    </span>
  );
}
