'use client';

import React from 'react';
import { PhoneCall, AlertCircle } from 'lucide-react';

interface EmergencyBannerProps {
  phone?: string;
  announcement?: string | null;
  active?: boolean;
}

export default function EmergencyBanner({
  phone = '+977 9800000000',
  announcement = '24/7 Emergency Electrical Breakdown Service Active in Kathmandu Valley',
  active = true,
}: EmergencyBannerProps) {
  if (!active || !announcement) return null;

  return (
    <div className="bg-slate-900 text-white text-xs sm:text-sm py-2 px-4 sm:px-6 lg:px-10 border-b border-slate-800">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold uppercase tracking-wide">
            24/7 Alert
          </span>
          <span className="text-slate-200">{announcement}</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>Emergency Line: {phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
