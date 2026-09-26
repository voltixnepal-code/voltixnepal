import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Check } from 'lucide-react';

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
          {/* Content Column (Text first on mobile) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 lg:order-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                About Us
              </h2>
              <p className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mt-1.5 leading-snug">
                {headline}
              </p>
            </div>

            <p
              className="text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bio1.replace('{ownerName}', `<strong>${ownerName}</strong>`) }}
            />

            <p className="text-sm text-slate-600 leading-relaxed">
              {bio2}
            </p>

            {/* Key Service Highlights & Action Buttons (Side-by-side on mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 sm:gap-6 pt-2 items-center">
              {/* Highlights */}
              <div className="sm:col-span-7 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2.5">
                {highlights.map((item, i) => (
                  <div key={i} className="flex items-start sm:items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons beside text on mobile */}
              <div className="sm:col-span-5 flex flex-col gap-2">
                <Link href="/request-service" className="btn-primary text-[11px] sm:text-xs font-bold text-center justify-center py-2.5 px-2.5 w-full">
                  {bookBtnText}
                </Link>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="btn-secondary text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 py-2.5 px-2.5 w-full"
                >
                  <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Call: {phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Photo Column (Photo second on mobile) */}
          <div className="lg:col-span-5 relative lg:order-1">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-md bg-white max-w-sm sm:max-w-md lg:max-w-none mx-auto">
              <Image
                src={ownerPhoto}
                alt={`${ownerName} - Electrical Contractor`}
                width={800}
                height={600}
                className="object-cover w-full h-[240px] sm:h-[320px] lg:h-[420px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
