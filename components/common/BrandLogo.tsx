import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
  type?: 'full' | 'icon' | 'square';
}

export default function BrandLogo({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  href = '/',
  className = '',
  type = 'full',
}: BrandLogoProps) {
  const isLight = variant === 'light';

  // Height sizing for the logo - scaled up for prominence without stretching navbar
  const heightClasses = {
    sm: 'h-8 sm:h-9 max-w-[170px] sm:max-w-[200px]',
    md: 'h-11 sm:h-13 md:h-16 max-w-[260px] sm:max-w-[320px] md:max-w-[380px]',
    lg: 'h-14 sm:h-16 md:h-20 max-w-[300px] sm:max-w-[380px] md:max-w-[420px]',
    xl: 'h-18 sm:h-22 md:h-26 max-w-[360px] sm:max-w-[460px]',
  }[size];

  const logoSrc =
    type === 'icon'
      ? '/icon.svg'
      : type === 'square'
      ? '/logo (2).PNG'
      : '/volti-x-nepal-logo.svg';

  // Transparent logo with illumination on dark theme for 100% clarity
  const imageFilterClass = isLight
    ? '[filter:drop-shadow(0_0_1.5px_#ffffff)_drop-shadow(0_0_6px_rgba(255,255,255,0.4))]'
    : '';

  const logoContent = (
    <div className={`bg-transparent inline-flex items-center group select-none ${className}`}>
      <img
        src={logoSrc}
        alt="VOLTI X NEPAL"
        className={`${heightClasses} ${imageFilterClass} w-auto object-contain group-hover:scale-105 transition-transform duration-200`}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src.indexOf('logo%20(1).PNG') === -1) {
            target.src = '/logo (1).PNG';
          }
        }}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center bg-transparent focus:outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
