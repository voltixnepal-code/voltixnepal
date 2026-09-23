'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from '@/lib/firebase';
import GoogleOneTap from '@/components/auth/GoogleOneTap';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Sync with database
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: userCredential.user.uid,
          name: userCredential.user.displayName || email.split('@')[0],
          email: userCredential.user.email,
        }),
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Failed to sign in. Please check your email and password.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Incorrect email or password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePopupFallback = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Customer',
          email: result.user.email,
        }),
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Google One Tap Native Prompt */}
      <GoogleOneTap
        buttonContainerId="googleSignInButtonWrapper"
        context="signin"
        onError={(err) => setError(err)}
      />

      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-red-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs font-bold">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Login
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your service request history & profile
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Native Google One-Tap / Identity Services Button Container */}
        <div className="space-y-3">
          <div id="googleSignInButtonWrapper" className="w-full flex justify-center min-h-[44px]">
            <button
              type="button"
              onClick={handleGooglePopupFallback}
              disabled={loading}
              className="btn-secondary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative border-t border-slate-200 my-4 text-center">
            <span className="bg-white px-2 text-[11px] text-slate-400 uppercase tracking-wider relative -top-2">
              Or with email password
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="form-label">Email Address</label>
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              <span>Sign In to Account</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-bold text-red-600 hover:text-red-700 underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
