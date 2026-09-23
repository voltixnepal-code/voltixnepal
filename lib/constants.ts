export const DEFAULT_SETTINGS = {
  businessName: 'VoltixNepal',
  ownerName: 'Sanjeet Mishra',
  tagline: 'Professional Electrical Services in Nepal',
  phone: '+977 9825870047',
  whatsappNumber: '9779825870047',
  email: 'sanjeet@voltixnepal.com',
  address: 'Kathmandu, Bagmati Province, Nepal',
  businessHours: 'Sun - Fri: 7:00 AM - 8:00 PM | Sat: Emergency Only',
  emergencyAvailable: true,
  emergencyPhone: '+977 9825870047',
  googleMapsUrl: 'https://maps.google.com/?q=Kathmandu,Nepal',
  footerText: 'Professional electrical installation, emergency repair, and maintenance services across Kathmandu Valley. Safety and punctuality guaranteed by Sanjeet Mishra.',
  announcementText: '24/7 Emergency Electrical Breakdown Service Active in Kathmandu Valley.',
  announcementActive: true,
  facebookUrl: 'https://facebook.com/voltixnepal',
  instagramUrl: 'https://instagram.com/voltixnepal',
  tiktokUrl: 'https://tiktok.com/@voltixnepal',
  youtubeUrl: 'https://youtube.com',
};

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  NEW: { label: 'New Request', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  CONTACTED: { label: 'Contacted', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
};

export const URGENCY_CONFIG: Record<string, { label: string; badge: string }> = {
  NORMAL: { label: 'Standard (1-2 Days)', badge: 'bg-slate-100 text-slate-800' },
  URGENT: { label: 'Urgent (Today)', badge: 'bg-amber-100 text-amber-900 border border-amber-300' },
  EMERGENCY: { label: 'Emergency (Immediate)', badge: 'bg-red-100 text-red-900 border border-red-300 font-semibold' },
};
