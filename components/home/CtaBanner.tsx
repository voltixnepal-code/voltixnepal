import React from 'react';
import Link from 'next/link';
import { CalendarCheck, Phone, ShieldCheck } from 'lucide-react';

interface CtaBannerProps {
  phone?: string;
  whatsappNumber?: string;
}

export default function CtaBanner({
  phone = '+977 9800000000',
  whatsappNumber = '9779800000000',
}: CtaBannerProps) {
  return (
    <section className="bg-red-600 text-white py-12 md:py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Need Reliable Electrical Work Done Today?
            </h2>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              From minor socket repairs to full house conduit wiring and emergency power restorations. Contact Sanjit Mishra at VoltixNepal for quality service.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/request-service"
              className="inline-flex items-center justify-center font-bold text-red-600 bg-white hover:bg-slate-100 transition-colors rounded-md px-6 py-3 text-sm shadow-md gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Send Service Request</span>
            </Link>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello%20VoltixNepal,%20I%20need%20electrical%20assistance.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-md px-6 py-3 text-sm shadow-md gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
