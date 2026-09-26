'use client';

import React, { useRef, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isTouched = false;

    const onTouchStart = () => {
      isTouched = true;
    };
    const onTouchEnd = () => {
      setTimeout(() => {
        isTouched = false;
      }, 3000);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    const interval = setInterval(() => {
      if (window.innerWidth >= 768 || isTouched) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const itemWidth = el.firstElementChild?.clientWidth || 280;
        el.scrollBy({ left: itemWidth + 16, behavior: 'smooth' });
      }
    }, 3500);

    return () => {
      clearInterval(interval);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-white w-full overflow-hidden" id="testimonials">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Homeowners & Businesses Say
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Verified feedback from clients across Kathmandu, Lalitpur, and Bhaktapur.
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-4 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="w-[85vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center p-6 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
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
