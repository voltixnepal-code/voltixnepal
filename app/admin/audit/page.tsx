'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Clock } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic log of all status updates, service edits, and configuration changes
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading audit history...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No audit logs recorded yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {log.adminEmail}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-red-600 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {log.entityType}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
