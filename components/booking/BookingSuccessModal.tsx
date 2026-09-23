import React from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageSquare, Phone, ArrowLeft, ExternalLink } from 'lucide-react';

interface BookingSuccessModalProps {
  requestId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  whatsappUrl: string;
  phone: string;
  onClose: () => void;
}

export default function BookingSuccessModal({
  requestId,
  customerName,
  customerPhone,
  serviceName,
  whatsappUrl,
  phone,
  onClose,
}: BookingSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Service Request Received
          </h3>
          <p className="text-xs text-slate-500">
            Your request has been logged successfully in our system.
          </p>
        </div>

        {/* Request Details Box */}
        <div className="bg-slate-50 rounded-md border border-slate-200 p-4 text-xs space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Request ID:</span>
            <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {requestId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-900">{customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Service:</span>
            <span className="font-semibold text-slate-900">{serviceName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Contact Number:</span>
            <span className="font-semibold text-slate-900">{customerPhone}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed text-center">
          Sanjeet Mishra will review your details and contact you shortly to confirm the technician visit.
        </p>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Open WhatsApp with Order Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>Call Sanjeet</span>
            </a>

            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Site</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
