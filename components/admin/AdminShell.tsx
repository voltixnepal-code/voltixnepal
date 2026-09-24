'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Client-side guard for admin pages
  React.useEffect(() => {
    if (pathname === '/admin/login') return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('voltix_admin_token') : null;
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('voltix_admin_session');

    if (!token && !hasCookie) {
      router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  // If on login page, don't show admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 w-full">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">{children}</main>
      </div>
    </div>
  );
}
