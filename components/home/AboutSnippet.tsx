import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Phone, Check } from 'lucide-react';

interface AboutSnippetProps {
  settings?: {
    ownerName?: string;
    phone?: string;
    whatsappNumber?: string;
    aboutOwnerPhoto?: string;
    aboutOwnerTitle?: string;
    aboutHeadline?: string;
    aboutBio1?: string;
    aboutBio2?: string;
    aboutHighlights?: string; // JSON string of string[]
    aboutBookBtnText?: string;
  };
}

export default function AboutSnippet({ settings }: AboutSnippetProps) {
  const ownerName      = settings?.ownerName      || 'Sanjit Mishra';
  const phone          = settings?.phone          || '+977 9800000000';
  const ownerPhoto     = settings?.aboutOwnerPhoto || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80';
  const ownerTitle     = settings?.aboutOwnerTitle || 'Lead Electrician & Proprietor';
  const headline       = settings?.aboutHeadline  || 'Experienced Hands-On Electrical Contractor in Kathmandu';
  const bookBtnText    = settings?.aboutBookBtnText || `Book a Service with ${ownerName}`;

  // Bio paragraphs — replace {ownerName} placeholder if used
  const bio1 = (settings?.aboutBio1 || `Hello, I am <strong>${ownerName}</strong>, the founder and chief electrician at <strong>VoltixNepal</strong>. I specialize in providing dependable, safe, and modern electrical services for residential apartments, independent homes, and commercial offices across Kathmandu Valley.`).replace('{ownerName}', ownerName);

  const bio2 = settings?.aboutBio2 || 'Whether you are rewiring a building, diagnosing a recurring circuit breaker trip, installing an inverter backup, or dealing with an unexpected power short circuit, I ensure meticulous attention to detail and zero compromises on safety standards.';

  // Parse highlights from JSON or use defaults
  let highlights: string[] = [
    'House Wiring & Concealed Piping',
    'Short Circuit Diagnostic & Megger Test',
    'Inverter & Battery Wiring',
    'Distribution Board Balancing',
  ];
  if (settings?.aboutHighlights) {
    try {
      const parsed = JSON.parse(settings.aboutHighlights);
      if (Array.isArray(parsed) && parsed.length > 0) highlights = parsed;
    } catch {}
  }

  return (
    <section className="py-14 md:py-20 bg-slate-50 border-t border-slate-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Photo Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-md bg-white">
              <Image
                src={ownerPhoto}
                alt={`${ownerName} - Electrical Contractor`}
                width={800}
                height={600}
                className="object-cover w-full h-[380px]"
              />
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{ownerName}</div>
                  <div className="text-xs text-slate-300">{ownerTitle}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VoltixNepal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100/80 border border-red-200/60 text-red-700 text-xs font-extrabold uppercase tracking-wider">
              <span>About Us</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {headline}
            </h2>

            <p
              className="text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bio1.replace('{ownerName}', `<strong>${ownerName}</strong>`) }}
            />

            <p className="text-sm text-slate-600 leading-relaxed">
              {bio2}
            </p>

            {/* Key Service Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Check className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link href="/request-service" className="btn-primary text-xs font-bold">
                {bookBtnText}
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
