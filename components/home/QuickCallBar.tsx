import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';

interface QuickCallBarProps {
  phone?: string;
  whatsappNumber?: string;
}

export default function QuickCallBar({
  phone = '+977 9825870047',
  whatsappNumber = '9779825870047',
}: QuickCallBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-slate-200 p-2 shadow-lg">
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-red-600 text-white font-bold text-xs shadow-xs active:bg-red-700"
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          <span>Call Electrician</span>
        </a>

        <a
          href={`https://wa.me/${whatsappNumber}?text=Hello%20VoltixNepal,%20I%20need%20electrical%20service.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-emerald-600 text-white font-bold text-xs shadow-xs active:bg-emerald-700"
        >
          <MessageSquare className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp Chat</span>
        </a>
      </div>
    </div>
  );
}
