import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';
import { Metadata } from 'next';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact VoltixNepal | Electrical Contractor',
  description:
    'Contact electrician Sanjeet Mishra for service appointments, 24/7 breakdown assistance, and house wiring quotes in Kathmandu.',
};

export const revalidate = 0;

export default async function ContactPage() {
  let settings = DEFAULT_SETTINGS as any;

  try {
    const dbSettings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });
    if (dbSettings) settings = dbSettings;
  } catch (err) {
    console.warn('Using default settings in Contact page:', err);
  }

  const businessName = settings?.businessName || 'VoltixNepal';
  const ownerName = settings?.ownerName || 'Sanjeet Mishra';
  const phone = settings?.phone || '+977 9825870047';
  const whatsappNumber = settings?.whatsappNumber || '9779825870047';
  const email = settings?.email || 'voltixnepal@gmail.com';
  const address = settings?.address || 'Kathmandu, Bagmati Province, Nepal';
  const hours =
    settings?.businessHours ||
    'Sunday - Friday: 7:00 AM - 8:00 PM | Saturday: Emergency Only';

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact VoltixNepal & Sanjeet Mishra
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Get in touch for electrical repairs, house wiring quotes, or 24/7 emergency power breakdown assistance across Kathmandu Valley.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Business & Contractor Info
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct contact details for Sanjeet Mishra.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Direct Phone</div>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="font-bold text-slate-900 hover:text-red-600 transition-colors"
                    >
                      {phone}
                    </a>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Available for 24/7 emergencies
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">WhatsApp Dispatch</div>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20VoltixNepal,%20I%20need%20electrical%20assistance.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      +{whatsappNumber}
                    </a>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Send photos of faulty boards / MCBs
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Email</div>
                    <a
                      href={`mailto:${email}`}
                      className="font-bold text-slate-900 hover:text-red-600 transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Coverage Area</div>
                    <div className="font-semibold text-slate-900">{address}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Kathmandu • Lalitpur • Bhaktapur
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Operating Hours</div>
                    <div className="font-semibold text-slate-900">{hours}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {ownerName}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Service Request Callout (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Prefer Booking Online?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Use our GPS-enabled service form to submit your exact address, issue description, and preferred appointment time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>Direct Dispatch</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    No middlemen or agency markups. Direct contact with Sanjeet Mishra.
                  </p>
                </div>

                <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>Emergency Priority</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Mark emergency in the form for immediate rapid technician routing.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/request-service"
                  className="btn-primary text-xs font-bold py-2.5 px-5"
                >
                  Go to Service Request Form
                </Link>
                <Link
                  href="/services"
                  className="btn-secondary text-xs font-bold py-2.5 px-5"
                >
                  View All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
