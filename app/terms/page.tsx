import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | VoltixNepal',
  description: 'Terms and conditions for electrical service contracting with VoltixNepal.',
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-lg border border-slate-200 shadow-xs space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 border-b border-slate-200 pb-4">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">Last updated: February 2026</p>

        <div className="prose prose-slate text-xs sm:text-sm leading-relaxed space-y-4 text-slate-700">
          <p>
            Welcome to <strong>VoltixNepal</strong>. By booking services through our platform, you agree to the following terms:
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            1. Service Estimates & Inspections
          </h2>
          <p>
            Standard troubleshooting visits involve an initial diagnostic inspection fee. All repairs and parts are quoted to the customer before physical work commences.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            2. Customer Responsibilities & Site Safety
          </h2>
          <p>
            Customers must provide safe, unobstructed access to distribution boards, switches, and work areas. If hazardous wiring or illegal tapping exists on the premises, the electrician reserves the right to isolate power for safety.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            3. Spare Parts & Warranties
          </h2>
          <p>
            Any manufacturer warranties on new fixtures, inverters, batteries, or switchgear are provided by the respective equipment manufacturers. Workmanship on installations is backed by our quality standard.
          </p>
        </div>
      </div>
    </div>
  );
}
