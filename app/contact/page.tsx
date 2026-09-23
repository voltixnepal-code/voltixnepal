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

export const metadata: Metadata = {
  title: 'Contact VoltixNepal | Electrical Contractor',
  description:
    'Contact electrician Sanjeet Mishra for service appointments, 24/7 breakdown assistance, and house wiring quotes in Kathmandu.',
};

export const revalidate = 0;

export default async function ContactPage() {
  const settings = await prisma.websiteSettings.findUnique({
    where: { id: 'default_settings' },
  });

  const businessName = settings?.businessName || 'VoltixNepal';
  const ownerName = settings?.ownerName || 'Sanjeet Mishra';
  const phone = settings?.phone || '+977 9800000000';
  const whatsappNumber = settings?.whatsappNumber || '9779800000000';
  const email = settings?.email || 'sanjeet@voltixnepal.com';
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
                  <div className="p-2 rounded bg-red-50 text-red-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Direct Phone</span>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="font-bold text-slate-900 hover:text-red-600"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-emerald-50 text-emerald-600 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">WhatsApp Business</span>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Hello%20VoltixNepal,%20I%20need%20electrical%20service.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      +{whatsappNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-blue-50 text-blue-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Email Inquiries</span>
                    <a
                      href={`mailto:${email}`}
                      className="font-bold text-slate-900 hover:text-red-600"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-50 text-amber-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Operating Area</span>
                    <span className="font-semibold text-slate-800">{address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-slate-100 text-slate-700 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Operating Hours</span>
                    <span className="font-medium text-slate-700">{hours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/request-service"
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Fill Online Service Request</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Map Representation & Coverage (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span>Service Coverage Map & Directions</span>
              </h3>
              <p className="text-xs text-slate-600">
                VoltixNepal is based in Kathmandu and serves all surrounding toles, neighborhoods, and commercial centers.
              </p>

              {/* Map Preview Box */}
              <div className="w-full h-80 rounded-md border border-slate-200 overflow-hidden bg-slate-100 relative flex items-center justify-center">
                <iframe
                  title="VoltixNepal Service Area"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113032.64621432139!2d85.2562426372074!3d27.708955944321396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu%2C%20Nepal!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Kathmandu • Lalitpur • Bhaktapur
                </span>
                <a
                  href="https://maps.google.com/?q=Kathmandu,Nepal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
