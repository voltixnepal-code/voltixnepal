import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | VoltixNepal',
  description: 'Privacy policy and data collection transparency for VoltixNepal services.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-lg border border-slate-200 shadow-xs space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 border-b border-slate-200 pb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: February 2026</p>

        <div className="prose prose-slate text-xs sm:text-sm leading-relaxed space-y-4 text-slate-700">
          <p>
            At <strong>VoltixNepal</strong> (operated by Sanjit Mishra), we respect your privacy. This policy explains how we collect and use your information when you request electrical services on our website.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            1. Information We Collect
          </h2>
          <p>
            When you submit a service request, we collect your name, phone number, email address (optional), street address, and GPS coordinates (if you click "Use My Current Location").
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            2. Purpose of Geolocation & Map Links
          </h2>
          <p>
            We only capture your location coordinates when you grant browser permission. This data is strictly used to generate a Google Maps driving route so our technician can reach your premises efficiently. We never sell or share your location with third-party advertisers.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            3. Communication Channels
          </h2>
          <p>
            We use your phone number and email to communicate service scheduling, arrival times, invoices, and emergency updates via WhatsApp, phone calls, and SMTP email.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            4. Data Security
          </h2>
          <p>
            Your records are stored securely in our database. We do not store sensitive payment card details on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
