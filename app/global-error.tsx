'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              VoltixNepal
            </h1>
            <p className="text-sm font-semibold text-red-600">
              System Recovery Mode
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              A critical error occurred while rendering the page. Click below to reload the application.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Reload Application
            </button>
            <a
              href="/"
              className="w-full py-2.5 px-4 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
