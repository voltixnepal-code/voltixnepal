import React from 'react';
import { Star, MapPin, Quote } from 'lucide-react';

interface TestimonialItem {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  content: string;
  date: string;
}

interface TestimonialSectionProps {
  testimonials: TestimonialItem[];
}

export default function TestimonialSection({
  testimonials,
}: TestimonialSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-white w-full" id="testimonials">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Homeowners & Businesses Say
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Verified feedback from clients across Kathmandu, Lalitpur, and Bhaktapur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {t.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{t.location}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {t.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
