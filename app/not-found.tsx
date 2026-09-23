'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Search,
  Home,
  Phone,
  MessageCircle,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileQuestion,
} from 'lucide-react';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickServices = [
    { name: 'House Wiring & Concealed Piping', href: '/services/house-wiring-installation' },
    { name: 'Short Circuit & MCB Tripping Repair', href: '/services/mcb-breaker-repair' },
    { name: 'Inverter & Battery Backup Setup', href: '/services/inverter-battery-setup' },
    { name: 'Commercial 3-Phase Electrical Panel', href: '/services/commercial-three-phase-wiring' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-10 bg-slate-50 w-full">
      <div className="max-w-3xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 text-center">
        
        {/* Animated Breaker / Circuit Illustration */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-linear-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 border-2 border-red-400/30">
            <div className="relative flex flex-col items-center">
              <Zap className="w-12 h-12 text-yellow-300 fill-current animate-pulse" />
              <span className="text-xs font-black tracking-widest uppercase text-white mt-1">
                404 TRIP
              </span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold border border-slate-700 shadow-xs flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Circuit Open</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            404 — Circuit Disconnected!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            The page you are looking for has been moved, re-wired, or switched off. Don&apos;t worry — our electrical services are fully active and running across Kathmandu Valley.
          </p>
        </div>

        {/* Search Bar for Electrical Services */}
        <form
          onSubmit={handleSearch}
          className="max-w-md mx-auto flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. Inverter, MCB, Wiring)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-xs sm:text-sm font-bold hover:bg-red-700 transition-colors shrink-0 shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Quick Help Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Home className="w-4 h-4 text-slate-300" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/services"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold hover:bg-red-700 transition-colors shadow-xs"
          >
            <Wrench className="w-4 h-4 text-white" />
            <span>All Services</span>
          </Link>

          <Link
            href="/request-service"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs sm:text-sm font-bold hover:bg-amber-400 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Book Electrician</span>
          </Link>
        </div>

        {/* Common Direct Links */}
        <div className="pt-6 border-t border-slate-100 text-left max-w-xl mx-auto space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center sm:text-left">
            Popular Electrical Solutions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickServices.map((svc) => (
              <Link
                key={svc.href}
                href={svc.href}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-red-50/70 border border-slate-200 hover:border-red-300 text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center justify-between transition-colors group"
              >
                <span className="truncate">{svc.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>

        {/* 24/7 Emergency Support Contact strip */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 24/7 Electrical Emergency In Kathmandu Valley
            </span>
            <p className="text-[11px] text-slate-400">
              Immediate dispatch for power breakdowns, short circuits & spark hazards
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:+9779825870047"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Sanjeet</span>
            </a>
            <a
              href="https://wa.me/9779825870047?text=Hello%20VoltixNepal,%20I%20need%20electrical%20assistance."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
