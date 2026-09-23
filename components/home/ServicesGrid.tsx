import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  ArrowRight,
  ShieldAlert,
  Wrench,
  BatteryCharging,
  ToggleRight,
  Lightbulb,
  Cpu,
  Building2,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  priceDisplay?: string | null;
  imageUrl: string;
  iconName: string;
}

interface ServicesGridProps {
  services: ServiceItem[];
}

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  AlertTriangle: <ShieldAlert className="w-5 h-5" />,
  ShieldCheck: <Wrench className="w-5 h-5" />,
  BatteryCharging: <BatteryCharging className="w-5 h-5" />,
  ToggleRight: <ToggleRight className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
};

export default function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <section className="bg-slate-50 py-14 md:py-20 border-y border-slate-200 w-full" id="services">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Professional Electrical Solutions in Nepal
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Safe, code-compliant residential and commercial electrical work handled by licensed and experienced technicians.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const icon = iconMap[service.iconName] || <Zap className="w-5 h-5" />;

            return (
              <div
                key={service.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-red-300 transition-all flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-xs">
                      {service.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <div className="p-1.5 rounded bg-red-50 text-red-600">
                        {icon}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition-colors">
                        {service.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {service.shortDescription}
                    </p>
                  </div>

                  {/* Pricing / Booking Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {service.priceDisplay || 'Affordable Rates'}
                    </span>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All & Custom Requirement CTA */}
        <div className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/services" className="btn-secondary text-xs font-bold">
            Explore All Services & Specs
          </Link>
          <Link href="/request-service" className="btn-primary text-xs font-bold">
            Book an Inspection
          </Link>
        </div>
      </div>
    </section>
  );
}
