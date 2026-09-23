import React from 'react';
import { STATUS_CONFIG, URGENCY_CONFIG } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = URGENCY_CONFIG[urgency] || {
    label: urgency,
    badge: 'bg-slate-100 text-slate-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}
    >
      {config.label}
    </span>
  );
}
