'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Lock, User, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('voltixnepal');
  const [password, setPassword] = useState('Apple@50#');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail,
          email: usernameOrEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid administrator credentials.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-red-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VoltixNepal Admin Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Administrator Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Authorized management access for Voltix Nepal Admin
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="form-label">Admin Username / Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="voltixnepal"
                className="form-input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Admin Password / PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Apple@50#"
                className="form-input pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Unlock Admin Panel</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          VoltixNepal Dispatch Engine • Kathmandu, Nepal
        </div>
      </div>
    </div>
  );
}
