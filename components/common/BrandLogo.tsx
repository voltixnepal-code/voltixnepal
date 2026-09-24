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
    sm: 'h-10 sm:h-12 max-w-[220px]',
    md: 'h-14 sm:h-16 md:h-18 max-w-[320px] sm:max-w-[420px]',
    lg: 'h-16 sm:h-20 md:h-24 max-w-[380px] sm:max-w-[480px]',
    xl: 'h-20 sm:h-24 md:h-30 max-w-[440px] sm:max-w-[560px]',
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
