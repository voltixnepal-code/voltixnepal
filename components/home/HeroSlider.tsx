'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Phone, CalendarCheck } from 'lucide-react';

export interface HeroSlideItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText?: string | null;
  secondaryBtnLink?: string | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface HeroSliderProps {
  slides: HeroSlideItem[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const activeSlides = slides.filter((s) => s.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  if (!activeSlides.length) return null;

  const current = activeSlides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section className="relative bg-slate-900 overflow-hidden min-h-[350px] sm:min-h-[420px] md:min-h-[640px] lg:min-h-[720px] flex items-center">
      {/* Background Image with Dark Contrast Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={current.imageUrl}
          alt={current.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.38] transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-transparent" />
      </div>

      {/* Slide Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 py-8 pb-16 sm:py-12 sm:pb-18 md:py-24 lg:py-32">
        <div className="max-w-4xl text-white space-y-3 sm:space-y-4 md:space-y-6">
          {/* Main Heading */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {current.title}
          </h1>

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-200 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
            {current.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <Link
              href={current.primaryBtnLink}
              className="inline-flex items-center justify-center font-bold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-md px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm shadow-md gap-1.5 sm:gap-2"
            >
              <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{current.primaryBtnText}</span>
            </Link>

            {current.secondaryBtnText && current.secondaryBtnLink && (
              <a
                href={current.secondaryBtnLink}
                className="inline-flex items-center justify-center font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-colors rounded-md px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm shadow-md gap-1.5 sm:gap-2"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                <span>{current.secondaryBtnText}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Slider Controls - Bottom Right <> arrows with no container */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-20 flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />
          </button>
        </div>
      )}
    </section>
  );
}
