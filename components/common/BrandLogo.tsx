import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export default function BrandLogo({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  href = '/',
  className = '',
}: BrandLogoProps) {
  const isLight = variant === 'light';

  // Dimension scaling
  const dimensions = {
    sm: { box: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]', svgSize: 32 },
    md: { box: 'w-10 h-10', text: 'text-xl', sub: 'text-[11px]', svgSize: 40 },
    lg: { box: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs', svgSize: 48 },
    xl: { box: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm', svgSize: 64 },
  }[size];

  const logoContent = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Precision Electrical Shield / Volt Emblem */}
      <div className={`relative ${dimensions.box} shrink-0 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform`}>
        <svg
          viewBox="0 0 44 44"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="65%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
            <filter id="boltGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#7F1D1D" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Solid Red-Amber Gradient Background with Border */}
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="9"
            fill="url(#shieldGrad)"
            stroke="#B91C1C"
            strokeWidth="1.5"
          />

          {/* Circuit Track Accents */}
          <path
            d="M7 22H13M31 22H37M22 7V13M22 31V37"
            stroke="#FCA5A5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="7" cy="22" r="1.5" fill="#FEF08A" />
          <circle cx="37" cy="22" r="1.5" fill="#FEF08A" />
          <circle cx="22" cy="7" r="1.5" fill="#FEF08A" />
          <circle cx="22" cy="37" r="1.5" fill="#FEF08A" />

          {/* High-Voltage Lightning Bolt */}
          <path
            d="M25 5L12.5 22.5H21L17.5 39L31.5 20H23L25 5Z"
            fill="url(#boltGrad)"
            stroke="#FEF08A"
            strokeWidth="0.8"
            strokeLinejoin="round"
            filter="url(#boltGlow)"
          />

          {/* Top Edge Gloss Reflection */}
          <path
            d="M2 10C2 5.58 5.58 2 10 2H34C38.42 2 42 5.58 42 10V20C42 20 30 14 2 20V10Z"
            fill="#FFFFFF"
            fillOpacity="0.18"
          />
        </svg>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col text-left">
        <span
          className={`font-black tracking-tight leading-none ${dimensions.text} ${
            isLight ? 'text-white' : 'text-slate-900'
          }`}
        >
          Voltix<span className="text-red-600 font-black">Nepal</span>
        </span>
        {showSubtitle && (
          <span
            className={`font-semibold tracking-normal mt-1 leading-tight ${dimensions.sub} ${
              isLight ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Electrical Services • Sanjeet Mishra
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
