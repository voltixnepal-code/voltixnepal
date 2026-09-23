export type UrgencyLevel = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export type RequestStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ContactPreference = 'WHATSAPP' | 'PHONE' | 'EMAIL';

export interface ServiceRequestInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  preferredContact?: ContactPreference;
  serviceId?: string;
  serviceName: string;
  urgency?: UrgencyLevel;
  preferredDate?: string;
  preferredTime?: string;
  description: string;
  address: string;
  area?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  additionalNotes?: string;
  userId?: string;
}

export interface WebsiteSettingsData {
  businessName: string;
  ownerName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  businessHours: string;
  emergencyAvailable: boolean;
  emergencyPhone: string;
  googleMapsUrl: string;
  footerText: string;
  announcementText?: string | null;
  announcementActive: boolean;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
}
