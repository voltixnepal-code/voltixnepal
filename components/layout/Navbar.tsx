'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  Menu,
  X,
  Phone,
  User,
  ShieldAlert,
  CalendarCheck,
  LogOut,
} from 'lucide-react';
import { auth, signOut } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import BrandLogo from '@/components/common/BrandLogo';

interface NavbarProps {
  settings?: {
    phone?: string;
    whatsappNumber?: string;
    businessName?: string;
  };
}

export default function Navbar({ settings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const pathname = usePathname();

  const businessPhone = settings?.phone || '+977 9825870047';

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch (e) {
      // Graceful local handling
    }
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo */}
          <BrandLogo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-red-600'
                      : 'text-slate-700 hover:text-red-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTA & Account Controls */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${businessPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>{businessPhone}</span>
            </a>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-md transition-colors"
                >
                  <User className="w-4 h-4 text-slate-600" />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-slate-500 hover:text-red-600 p-1.5"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 px-2.5 py-1.5"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Login</span>
              </Link>
            )}

            <Link
              href="/request-service"
              className="btn-primary flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Request Service</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={`tel:${businessPhone.replace(/\s+/g, '')}`}
              className="p-2 rounded-md bg-red-50 text-red-600 border border-red-200"
              aria-label="Call Now"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-base font-semibold ${
                    isActive
                      ? 'bg-red-50 text-red-600'
                      : 'text-slate-800 hover:bg-slate-50 hover:text-red-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/request-service"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Request Service</span>
            </Link>

            {user ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center text-xs py-2"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="btn-secondary text-center text-xs py-2 text-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center text-xs py-2"
                >
                  Customer Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center text-xs py-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
