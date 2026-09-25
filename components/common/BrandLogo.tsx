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

  // Height sizing for the logo - prominent, bold and readable across all devices
  const heightClasses = {
    sm: 'h-9 sm:h-11 max-w-[200px]',
    md: 'h-11 sm:h-13 md:h-15 max-w-[280px] sm:max-w-[360px]',
    lg: 'h-13 sm:h-15 md:h-18 max-w-[340px] sm:max-w-[420px]',
    xl: 'h-16 sm:h-20 md:h-24 max-w-[420px] sm:max-w-[500px]',
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

