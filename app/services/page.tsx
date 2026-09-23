import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Phone,
  CalendarCheck,
} from 'lucide-react';
import { Metadata } from 'next';

import { DEFAULT_SERVICES } from '@/lib/default-data';

export const metadata: Metadata = {
  title: 'Electrical Services in Kathmandu Valley',
  description:
    'Explore complete residential and commercial electrical services: House wiring, fault repair, MCB panels, inverter setups, and lighting.',
};

export const revalidate = 0;

export default async function ServicesPage() {
  let services = DEFAULT_SERVICES as any[];
  try {
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (dbServices && dbServices.length > 0) {
      services = dbServices;
    }
  } catch (err) {
    console.warn('Using default services:', err);
  }

  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Electrical Installation & Repair Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Reliable, code-compliant residential and commercial electrical solutions across Kathmandu, Lalitpur, and Bhaktapur.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const benefits = JSON.parse(service.benefits || '[]');

            return (
              <div
                key={service.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-red-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-slate-900/80 text-white text-xs font-semibold backdrop-blur-xs">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                      {service.title}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {service.shortDescription}
                    </p>

                    {benefits.length > 0 && (
                      <div className="space-y-1.5 mb-4 border-t border-slate-100 pt-3">
                        {benefits.slice(0, 2).map((b: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-slate-700"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="line-clamp-1">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700">
                    {service.priceDisplay || 'Site Quote'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/services/${service.slug}`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/request-service?service=${service.slug}`}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Booking Box */}
        <div className="mt-14 p-8 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Need a custom electrical project quote?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Have an entire apartment, commercial complex, or emergency breakdown not listed here?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/request-service" className="btn-primary text-xs font-bold">
              Submit Custom Request
            </Link>
            <Link href="/contact" className="btn-secondary text-xs font-bold">
              Contact Sanjeet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
