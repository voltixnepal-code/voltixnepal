import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Facebook,
  Instagram,
  Youtube,
} from 'lucide-react';

import BrandLogo from '@/components/common/BrandLogo';

interface FooterProps {
  settings?: {
    businessName?: string;
    ownerName?: string;
    phone?: string;
    whatsappNumber?: string;
    email?: string;
    address?: string;
    businessHours?: string;
    footerText?: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
  };
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const businessName = settings?.businessName || 'VoltixNepal';
  const ownerName = settings?.ownerName || 'Sanjit Mishra';
  const phone = settings?.phone || '+977 9825870047';
  const email = settings?.email || 'sanjit@voltixnepal.com';
  const address = settings?.address || 'Kathmandu, Bagmati Province, Nepal';
  const hours = settings?.businessHours || 'Sun - Fri: 7:00 AM - 8:00 PM | Sat: Emergency Only';
  const footerText =
    settings?.footerText ||
    'Professional electrical installation, emergency repair, and maintenance services across Kathmandu Valley. Certified safety standards and punctuality guaranteed by Sanjit Mishra.';

  return (
    <footer className="bg-black text-neutral-200 border-t border-neutral-800 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <BrandLogo variant="light" size="md" />
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              {footerText}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Lead Electrician: {ownerName}</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2.5">
              Our Services
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
              <li>
                <Link href="/services/house-wiring" className="hover:text-white hover:underline transition-colors block">
                  House Wiring & Piping
                </Link>
              </li>
              <li>
                <Link href="/services/fault-finding-repair" className="hover:text-white hover:underline transition-colors block">
                  Short Circuit & Fault Finding
                </Link>
              </li>
              <li>
                <Link href="/services/mcb-distribution-board" className="hover:text-white hover:underline transition-colors block">
                  MCB & Distribution Boards
                </Link>
              </li>
              <li>
                <Link href="/services/inverter-battery-installation" className="hover:text-white hover:underline transition-colors block">
                  Inverter & Battery Setup
                </Link>
              </li>
              <li>
                <Link href="/services/switch-socket-installation" className="hover:text-white hover:underline transition-colors block">
                  Switch, Socket & Fixtures
                </Link>
              </li>
              <li>
                <Link href="/services/earthing-surge-protection" className="hover:text-white hover:underline transition-colors block">
                  Earthing & Grounding
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
              <li>
                <Link href="/request-service" className="text-red-400 font-bold hover:text-red-300 transition-colors block">
                  Request a Service
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors block">
                  Work Gallery & Videos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:underline transition-colors block">
                  About Sanjit Mishra
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white hover:underline transition-colors block">
                  Electrical Safety Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white hover:underline transition-colors block">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors block">
                  Contact & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2.5">
              Contact & Hours
            </h3>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
              <Phone className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white font-semibold transition-colors">
                {phone}
              </a>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
              <Mail className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                {email}
              </a>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
              <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span>{address}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 pt-1">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span className="text-xs">{hours}</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2.5 pt-3">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="p-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Developer Credit & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          
          {/* Copyright */}
          <p className="text-neutral-400 text-center md:text-left">
            © {currentYear} <strong className="text-white font-semibold">{businessName}</strong>. All rights reserved.
          </p>

          {/* Developed by credit */}
          <div className="flex items-center text-xs text-neutral-400">
            <span>Developed by{' '}</span>
            <a
              href="https://bishalcodes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-white font-medium hover:text-red-400 transition-colors"
            >
              bishalcodes.com
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-3 text-neutral-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
