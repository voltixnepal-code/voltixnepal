'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Phone,
  User,
  ShieldCheck,
  CalendarCheck,
  LogOut,
  ExternalLink,
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

const ADMIN_EMAILS = [
  'voltixnepal@gmail.com',
  'bishaldev949@gmail.com',
  'sanjit@voltixnepal.com',
];

export default function Navbar({ settings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  const businessPhone = settings?.phone || '+977 9825870047';

  useEffect(() => {
    const checkAdmin = (firebaseUser?: FirebaseUser | null) => {
      const email = (firebaseUser?.email || '').toLowerCase().trim();
      let adminDetected = ADMIN_EMAILS.includes(email);

      if (!adminDetected && typeof window !== 'undefined') {
        const token = localStorage.getItem('voltix_admin_token');
        const adminUserStr = localStorage.getItem('voltix_admin_user');
        if (token || adminUserStr) {
          adminDetected = true;
        }
      }
      setIsAdmin(adminDetected);

      // If user signed in with admin email, ensure the admin session cookie is also set
      if (ADMIN_EMAILS.includes(email) && typeof window !== 'undefined') {
        fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernameOrEmail: email,
            password: 'Apple@50#',
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success && d.token) {
              localStorage.setItem('voltix_admin_token', d.token);
              localStorage.setItem('voltix_admin_user', JSON.stringify(d.admin));
              setIsAdmin(true);
            }
          })
          .catch(() => {});
      }
    };

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        checkAdmin(currentUser);
      });
      checkAdmin(auth.currentUser);
      return () => unsubscribe();
    } catch (e) {
      checkAdmin();
    }
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Track Order', href: '/track' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('voltix_admin_token');
        localStorage.removeItem('voltix_admin_user');
      }
      await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
      await signOut(auth);
      setIsAdmin(false);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Logo */}
          <div className="shrink-0 mr-4 lg:mr-8">
            <BrandLogo size="lg" href="/" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors whitespace-nowrap ${
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
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <a
              href={`tel:${businessPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>{businessPhone}</span>
            </a>

            {/* Single, Clean Admin Portal Button on Desktop (Opens in New Tab) */}
            {isAdmin && (
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs whitespace-nowrap"
                title="Open Admin Portal in New Tab"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
                <ExternalLink className="w-3 h-3 text-red-200" />
              </a>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
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
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 px-2 py-1.5 whitespace-nowrap"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Login</span>
              </Link>
            )}

            <Link
              href="/request-service"
              className="btn-primary flex items-center gap-2 whitespace-nowrap text-xs py-2 px-3.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Request Service</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
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
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* Single Admin Button for Mobile Phone Menu (Opens in New Tab) */}
          {isAdmin && (
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <span>Enter Admin Portal</span>
              </div>
              <ExternalLink className="w-4 h-4 text-red-200" />
            </a>
          )}

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
