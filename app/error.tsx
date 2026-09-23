'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Phone } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Voltix Application runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50 w-full">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            Something went wrong!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An unexpected error occurred while loading this page. You can try refreshing or returning to our homepage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <a
            href="tel:+9779825870047"
            className="text-xs text-red-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Emergency Support: +977 9825870047</span>
          </a>
        </div>
      </div>
    </div>
  );
}
