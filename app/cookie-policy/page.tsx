import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | VoltixNepal',
  description: 'Cookie usage and session management policy on VoltixNepal.',
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-lg border border-slate-200 shadow-xs space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 border-b border-slate-200 pb-4">
          Cookie Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: February 2026</p>

        <div className="prose prose-slate text-xs sm:text-sm leading-relaxed space-y-4 text-slate-700">
          <p>
            <strong>VoltixNepal</strong> uses minimal, essential cookies to keep you logged in to your customer/admin dashboard and store your session securely. We do not use intrusive cross-site tracking cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
