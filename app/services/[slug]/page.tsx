import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  MapPin,
  CalendarCheck,
  Phone,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { Metadata } from 'next';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DEFAULT_SERVICES } from '@/lib/default-data';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let service: any = null;
  try {
    service = await prisma.service.findUnique({
      where: { slug: params.slug },
    });
  } catch (e) {
    // fallback
  }

  if (!service) {
    service = DEFAULT_SERVICES.find((s) => s.slug === params.slug);
  }

  if (!service) return { title: 'Service Not Found | VoltixNepal' };

  return {
    title: `${service.title} | VoltixNepal`,
    description: service.shortDescription,
    openGraph: {
      title: `${service.title} - VoltixNepal`,
      description: service.shortDescription,
      images: [{ url: service.imageUrl }],
    },
  };
}

export const revalidate = 0;

export default async function ServiceDetailPage({ params }: Props) {
  let service: any = null;
  let settings: any = DEFAULT_SETTINGS;
  let otherServices: any[] = [];

  try {
    service = await prisma.service.findUnique({
      where: { slug: params.slug },
    });
    const dbSettings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });
    if (dbSettings) settings = dbSettings;
  } catch (err) {
    console.warn('DB read error in service detail:', err);
  }

  if (!service) {
    service = DEFAULT_SERVICES.find((s) => s.slug === params.slug);
  }

  if (!service) {
    notFound();
  }

  const benefits: string[] = JSON.parse(service.benefits || '[]');
  const includedItems: string[] = JSON.parse(service.includedItems || '[]');
  const whenNeeded: string[] = JSON.parse(service.whenNeeded || '[]');

  try {
    otherServices = await prisma.service.findMany({
      where: {
        id: { not: service.id },
        isActive: true,
      },
      take: 3,
    });
  } catch (err) {
    otherServices = DEFAULT_SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);
  }

  const businessPhone = settings?.phone || '+977 9800000000';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltixnepal.com';
  const serviceSchema = generateServiceSchema(service, baseUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Services', url: `${baseUrl}/services` },
    { name: service.title, url: `${baseUrl}/services/${service.slug}` },
  ]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-14 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="w-full px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Services</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Box */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
                {service.category} Service
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                {service.title}
              </h1>

              {/* Photo */}
              <div className="relative h-64 sm:h-80 w-full rounded-md overflow-hidden bg-slate-100 mb-6">
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>

              {/* Full Description */}
              <div className="prose prose-slate text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
                <p>{service.fullDescription}</p>
              </div>
            </div>

            {/* Key Benefits */}
            {benefits.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <span>Key Safety & Quality Benefits</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((b, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-md bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs sm:text-sm text-slate-800"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What is Included */}
            {includedItems.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  <span>What is Included in This Service</span>
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {includedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* When Customers Need It */}
            {whenNeeded.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <span>When Do You Need This Service?</span>
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {whenNeeded.map((wn, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                      <span>{wn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar CTA & Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct Booking Card */}
            <div className="bg-white rounded-lg border-2 border-red-600 p-6 shadow-sm sticky top-24 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Service Quote
                </span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {service.priceDisplay || 'Inspection & Quote on Site'}
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/request-service?service=${service.slug}`}
                  className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Request This Service</span>
                </Link>

                <a
                  href={`tel:${businessPhone.replace(/\s+/g, '')}`}
                  className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>Call {businessPhone}</span>
                </a>
              </div>

              {/* Coverage Area */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Service Coverage Area</span>
                </div>
                <p className="leading-relaxed pl-6 text-slate-500">
                  {service.serviceArea}
                </p>
              </div>

              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Emergency breakdown?</strong> Mention emergency in the request form for expedited dispatch.</span>
              </div>
            </div>

            {/* Other Services */}
            {otherServices.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Other Electrical Services
                </h3>
                <div className="space-y-3">
                  {otherServices.map((os) => (
                    <Link
                      key={os.id}
                      href={`/services/${os.slug}`}
                      className="block p-3 rounded-md hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <div className="text-xs font-bold text-slate-900 hover:text-red-600">
                        {os.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {os.shortDescription}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
