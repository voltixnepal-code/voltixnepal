import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Phone, Check, MapPin } from 'lucide-react';

interface AboutSnippetProps {
  settings?: {
    ownerName?: string;
    phone?: string;
    whatsappNumber?: string;
  };
}

export default function AboutSnippet({ settings }: AboutSnippetProps) {
  const ownerName = settings?.ownerName || 'Sanjit Mishra';
  const phone = settings?.phone || '+977 9800000000';

  return (
    <section className="py-14 md:py-20 bg-slate-50 border-t border-slate-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Photo Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-md bg-white">
              <Image
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80"
                alt="Sanjit Mishra - Electrical Contractor"
                width={800}
                height={600}
                className="object-cover w-full h-[380px]"
              />
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{ownerName}</div>
                  <div className="text-xs text-slate-300">Lead Electrician & Proprietor</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VoltixNepal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Experienced Hands-On Electrical Contractor in Kathmandu
            </h2>

            <p className="text-sm text-slate-700 leading-relaxed">
              Hello, I am <strong>{ownerName}</strong>, the founder and chief electrician at <strong>VoltixNepal</strong>. I specialize in providing dependable, safe, and modern electrical services for residential apartments, independent homes, and commercial offices across Kathmandu Valley.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              Whether you are rewiring a building, diagnosing a recurring circuit breaker trip, installing an inverter backup, or dealing with an unexpected power short circuit, I ensure meticulous attention to detail and zero compromises on safety standards.
            </p>

            {/* Key Service Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Check className="w-4 h-4 text-red-600 shrink-0" />
                <span>House Wiring & Concealed Piping</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Check className="w-4 h-4 text-red-600 shrink-0" />
                <span>Short Circuit Diagnostic & Megger Test</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Check className="w-4 h-4 text-red-600 shrink-0" />
                <span>Inverter & Battery Wiring</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Check className="w-4 h-4 text-red-600 shrink-0" />
                <span>Distribution Board Balancing</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link href="/request-service" className="btn-primary text-xs font-bold">
                Book a Service with Sanjit
              </Link>
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="btn-secondary text-xs font-bold flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>Call Directly: {phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
