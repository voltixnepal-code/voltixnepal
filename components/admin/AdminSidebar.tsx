'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  SlidersHorizontal,
  Layers,
  FileText,
  HelpCircle,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  LogOut,
  Zap,
  ExternalLink,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile = () => {},
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Service Requests', href: '/admin/requests', icon: ClipboardList },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Services CMS', href: '/admin/services', icon: Wrench },
    { label: 'Hero Slider', href: '/admin/hero', icon: SlidersHorizontal },
    { label: 'Media & Cloudinary', href: '/admin/media', icon: Layers },
    { label: 'Homepage Sections', href: '/admin/homepage', icon: Layers },
    { label: 'Blog & Guides', href: '/admin/blog', icon: FileText },
    { label: 'FAQs', href: '/admin/faq', icon: HelpCircle },
    { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'Website Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', href: '/admin/audit', icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-black text-neutral-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-900 bg-black">
        <BrandLogo variant="light" size="sm" href="/admin" showSubtitle={false} />
        <span className="px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 font-bold text-[10px] uppercase border border-red-500/30">
          Admin
        </span>
        <button
          onClick={onCloseMobile}
          className="md:hidden text-neutral-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 bg-black">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-4 border-t border-neutral-900 bg-black space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <span>View Public Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-neutral-900 bg-black fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs h-full bg-black z-10 shadow-2xl border-r border-neutral-900">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
