import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Phone,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { Metadata } from 'next';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Sanjit Mishra & VoltixNepal',
  description:
    'Learn about Sanjit Mishra, electrical service contractor in Kathmandu, safety standards, and commercial services.',
};

export const revalidate = 0;

export default async function AboutPage() {
  let settings = DEFAULT_SETTINGS as any;

  try {
    const dbSettings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });
    if (dbSettings) settings = dbSettings;
  } catch (err) {
    console.warn('Using default settings in About page:', err);
  }

  const ownerName = settings?.ownerName || 'Sanjit Mishra';
  const businessPhone = settings?.phone || '+977 9825870047';

  return (
    <div className="bg-white min-h-screen py-10 md:py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        {/* Top Intro Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Reliable Electrical Workmanship with Safety at the Core
            </h1>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              <strong>VoltixNepal</strong> was founded by <strong>{ownerName}</strong> to address a persistent issue in the Kathmandu Valley electrical contracting space: the lack of standardized safety, transparent diagnostics, and punctual technician dispatch.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Electrical work is not just about making lights turn on; it is about protecting lives, eliminating fire hazards, and ensuring home appliances function safely without voltage drop or insulation failure.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/request-service" className="btn-primary text-xs font-bold">
                Book a Service
              </Link>
              <a
                href={`tel:${businessPhone.replace(/\s+/g, '')}`}
                className="btn-secondary text-xs font-bold flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>Call {businessPhone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-md bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80"
                alt="Sanjit Mishra Electrician"
                width={800}
                height={600}
                className="object-cover w-full h-[400px]"
              />
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{ownerName}</div>
                  <div className="text-xs text-slate-300">Lead Electrician & Proprietor</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>VoltixNepal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Working Principles */}
        <div className="border-t border-slate-200 pt-14 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">
              Our Core Service Standards
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Every job, from a simple switch replacement to a 5-story commercial building, is executed with strict discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Precision Diagnostic Tools
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We test insulation resistance, earth loop impedance, and true RMS voltage before and after any repair to verify that the fault is 100% eliminated.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Genuine Certified Materials
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We advocate for ISI/NS certified flame-retardant copper conductors, properly rated MCB/RCCB breakers, and heavy-duty brass terminal sockets.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Punctual & Direct Communication
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No third-party call centers or middlemen. You speak directly with the electrician who will diagnose and repair your system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
