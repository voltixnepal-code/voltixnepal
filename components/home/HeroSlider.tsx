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
    <section className="relative bg-slate-900 overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
      {/* Background Image with Dark Contrast Overlay (Not full-black screen, just photo backdrop) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={current.imageUrl}
          alt={current.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.38] transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
      </div>

      {/* Slide Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 py-14 md:py-20">
        <div className="max-w-3xl text-white space-y-4 md:space-y-6">
          {/* Main Heading - Normal professional sizing, not giant */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {current.title}
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-xl">
            {current.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={current.primaryBtnLink}
              className="inline-flex items-center justify-center font-bold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-md px-6 py-3 text-sm shadow-md gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{current.primaryBtnText}</span>
            </Link>

            {current.secondaryBtnText && current.secondaryBtnLink && (
              <a
                href={current.secondaryBtnLink}
                className="inline-flex items-center justify-center font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-colors rounded-md px-6 py-3 text-sm shadow-md gap-2"
              >
                <Phone className="w-4 h-4 text-red-600" />
                <span>{current.secondaryBtnText}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Slider Controls - Clean unified bottom pill */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-xl">
          <button
            onClick={handlePrev}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 px-1">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-red-600'
                    : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
