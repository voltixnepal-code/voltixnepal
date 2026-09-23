'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { auth, sendPasswordResetEmail } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-red-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs font-bold">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            We will send a password reset link to your email
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-emerald-900">
              Reset Link Sent!
            </div>
            <p className="text-xs text-emerald-700">
              Check your inbox for instructions to reset your password.
            </p>
            <Link
              href="/login"
              className="btn-primary inline-flex items-center text-xs py-2 px-4 mt-2"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="form-label">Account Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
