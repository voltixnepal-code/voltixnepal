import React from 'react';
import prisma from '@/lib/prisma';
import ServiceRequestForm from '@/components/booking/ServiceRequestForm';
import { ShieldCheck, Phone, Clock, MapPin } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request Electrical Service | VoltixNepal',
  description:
    'Book an electrical service in Kathmandu Valley. Instant WhatsApp & email confirmation with GPS location capture.',
};

export const revalidate = 0;

interface RequestServicePageProps {
  searchParams: {
    service?: string;
    urgency?: string;
  };
}

export default async function RequestServicePage({
  searchParams,
}: RequestServicePageProps) {
  const [services, settings] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, title: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    }),
  ]);

  const defaultServiceSlug = searchParams.service;
  const defaultUrgency = searchParams.urgency || 'NORMAL';

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Column (8 cols) */}
          <div className="lg:col-span-8">
            <ServiceRequestForm
              services={services}
              defaultServiceSlug={defaultServiceSlug}
              defaultUrgency={defaultUrgency}
              settings={{
                phone: settings?.phone,
                whatsappNumber: settings?.whatsappNumber,
              }}
            />
          </div>

          {/* Service Guarantee / FAQ Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Guarantee Box */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <span>Our Service Commitment</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-900">Direct Technician Dispatch:</strong> Request is received directly by Sanjeet Mishra without call-center delays.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-900">GPS Location Routing:</strong> We use your exact map location to reach your doorstep quickly.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-900">Dual Channel Confirmation:</strong> Order receipt sent via both WhatsApp and email.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Helpline */}
            <div className="bg-slate-900 text-white rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Immediate Assistance</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Need an Emergency Electrician Right Now?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you are facing an urgent power cut, short circuit, or burning smell, call our helpline directly:
              </p>
              <a
                href={`tel:${(settings?.phone || '+977 9800000000').replace(/\s+/g, '')}`}
                className="btn-primary w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {settings?.phone || '+977 9800000000'}</span>
              </a>
            </div>

            {/* Service Coverage Areas */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Serving All Kathmandu Valley</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Kathmandu (Baneshwor, Koteshwor, Chabahil, Maharajgunj, Balaju, Kalanki), Lalitpur (Patan, Jhamsikhel, Kupondole, Imadol), and Bhaktapur (Sallaghari, Suryabinayak, Thimi).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
