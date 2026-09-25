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

  // Height sizing for the logo - well proportioned and crisp across all viewports
  const heightClasses = {
    sm: 'h-8 sm:h-9 max-w-[160px]',
    md: 'h-9 sm:h-11 max-w-[210px] sm:max-w-[240px]',
    lg: 'h-11 sm:h-13 max-w-[260px] sm:max-w-[300px]',
    xl: 'h-14 sm:h-16 max-w-[320px] sm:max-w-[380px]',
  }[size];

  const logoSrc =
    type === 'icon'
      ? '/icon.svg'
      : type === 'square'
      ? '/logo (2).PNG'
      : isLight
      ? '/logo-white.png'
      : '/logo (1).PNG';

  const logoContent = (
    <div className={`bg-transparent inline-flex items-center group select-none ${className}`}>
      <img
        src={logoSrc}
        alt="VOLTI X NEPAL"
        className={`${heightClasses} w-auto object-contain group-hover:scale-105 transition-transform duration-200`}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src.indexOf('logo (1).PNG') === -1) {
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

