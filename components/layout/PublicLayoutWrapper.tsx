'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface PublicLayoutWrapperProps {
  settings: any;
  children: React.ReactNode;
}

export default function PublicLayoutWrapper({
  settings,
  children,
}: PublicLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Clean admin environment without public header/footer/emergency banner
    return <>{children}</>;
  }

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
