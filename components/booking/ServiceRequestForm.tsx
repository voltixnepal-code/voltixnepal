'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  Navigation,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';
import BookingSuccessModal from './BookingSuccessModal';

interface ServiceOption {
  id: string;
  slug: string;
  title: string;
}

interface ServiceRequestFormProps {
  services: ServiceOption[];
  defaultServiceSlug?: string;
  defaultUrgency?: string;
  settings?: {
    phone?: string;
    whatsappNumber?: string;
  };
}

export default function ServiceRequestForm({
  services,
  defaultServiceSlug,
  defaultUrgency = 'NORMAL',
  settings,
}: ServiceRequestFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState<'WHATSAPP' | 'PHONE' | 'EMAIL'>('WHATSAPP');
  const [selectedService, setSelectedService] = useState('');
  const [urgency, setUrgency] = useState(defaultUrgency);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Kathmandu');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Geolocation States
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    requestId: string;
    whatsappUrl: string;
  } | null>(null);

  const businessPhone = settings?.phone || '+977 9800000000';
  const businessWhatsApp = settings?.whatsappNumber || '9779800000000';

  useEffect(() => {
    if (defaultServiceSlug && services.length > 0) {
      const match = services.find((s) => s.slug === defaultServiceSlug);
      if (match) {
        setSelectedService(match.title);
      }
    } else if (services.length > 0 && !selectedService) {
      setSelectedService(services[0].title);
    }
  }, [defaultServiceSlug, services]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser. Please enter address manually.');
      return;
    }

    setLocating(true);
    setLocationStatus('Locating your position via GPS...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocating(false);
        setLocationStatus(`Location acquired: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('Location access denied. Please type your address manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('Location information unavailable. Please enter address.');
            break;
          default:
            setLocationStatus('Could not retrieve location. Please enter address manually.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 7) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }
    if (!selectedService) {
      setErrorMessage('Please select a service category.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the electrical issue.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please enter your street address or landmark.');
      return;
    }

    setIsSubmitting(true);

    try {
      const googleMapsUrl =
        latitude && longitude
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : null;

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: customerEmail.trim() || undefined,
          preferredContact,
          serviceName: selectedService,
          urgency,
          preferredDate: preferredDate || undefined,
          preferredTime: preferredTime || undefined,
          description,
          address,
          area: area.trim() || undefined,
          city,
          latitude,
          longitude,
          googleMapsUrl,
          additionalNotes: additionalNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit service request.');
      }

      setSuccessData({
        requestId: data.requestId,
        whatsappUrl: data.whatsappUrl,
      });

      // Automatically open WhatsApp in background/new tab if user requested it
      if (preferredContact === 'WHATSAPP' && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Book an Electrician
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Fill out your requirement and location. Request is dispatched directly to Sanjit Mishra.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
              1
            </span>
            <span>Your Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="form-label">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="customerPhone" className="form-label">
                Phone Number / WhatsApp <span className="text-red-600">*</span>
              </label>
              <input
                id="customerPhone"
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9841000000"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerEmail" className="form-label">
                Email Address <span className="text-slate-400 text-xs">(Optional for receipt)</span>
              </label>
              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. ramesh@example.com"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Preferred Contact Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['WHATSAPP', 'PHONE', 'EMAIL'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContact(method)}
                    className={`py-2 px-2 text-xs font-semibold rounded-md border text-center transition-colors ${
                      preferredContact === method
                        ? 'bg-red-50 border-red-600 text-red-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {method === 'WHATSAPP' && 'WhatsApp'}
                    {method === 'PHONE' && 'Phone Call'}
                    {method === 'EMAIL' && 'Email'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Service & Requirement */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
              2
            </span>
            <span>Service & Problem Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="serviceSelect" className="form-label">
                Select Service <span className="text-red-600">*</span>
              </label>
              <select
                id="serviceSelect"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="form-input bg-white font-medium"
                required
              >
                <option value="" disabled>-- Choose Electrical Service --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title}
                  </option>
                ))}
                <option value="Other Electrical Repair">Other Electrical Requirement</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Urgency Level <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'NORMAL', label: 'Standard', sub: '1-2 Days' },
                  { id: 'URGENT', label: 'Urgent', sub: 'Today' },
                  { id: 'EMERGENCY', label: 'Emergency', sub: 'Immediate' },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id)}
                    className={`py-1.5 px-2 rounded-md border text-center transition-colors ${
                      urgency === u.id
                        ? u.id === 'EMERGENCY'
                          ? 'bg-red-600 border-red-700 text-white font-bold'
                          : 'bg-red-50 border-red-600 text-red-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">{u.label}</div>
                    <div className={`text-[10px] ${urgency === u.id && u.id === 'EMERGENCY' ? 'text-red-100' : 'text-slate-400'}`}>
                      {u.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="problemDesc" className="form-label">
              Problem / Requirement Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="problemDesc"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Main MCB trips when water heater is switched on, or need complete 3BHK house wiring estimation..."
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferredDate" className="form-label">
                Preferred Date <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <input
                id="preferredDate"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="preferredTime" className="form-label">
                Preferred Time <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <input
                id="preferredTime"
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="e.g. Morning (9 AM - 12 PM)"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* 3. Location Information */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Service Location</span>
            </h3>

            {/* Geolocation Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors disabled:opacity-60"
            >
              {locating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-red-600" />
              )}
              <span>{locating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
            </button>
          </div>

          {locationStatus && (
            <div
              className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                latitude && longitude
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              {latitude && longitude ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="flex-1">{locationStatus}</span>
              {latitude && longitude && (
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5"
                >
                  <span>Preview Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="addressInput" className="form-label">
                Full Street Address / Landmark <span className="text-red-600">*</span>
              </label>
              <input
                id="addressInput"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House No. 45, Near Shanti Chowk"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="areaInput" className="form-label">
                Area / Tole
              </label>
              <input
                id="areaInput"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Baneshwor"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cityInput" className="form-label">
                City / District
              </label>
              <select
                id="cityInput"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input bg-white"
              >
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Other Valley Area">Other Valley Area</option>
              </select>
            </div>

            <div>
              <label htmlFor="notesInput" className="form-label">
                Additional Notes <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <input
                id="notesInput"
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Gate bell is broken, please call on arrival"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SENDING REQUEST...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>SEND SERVICE REQUEST</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            By submitting, you agree to receive technician arrival updates via WhatsApp / Call / Email.
          </p>
        </div>
      </form>

      {/* Success Modal */}
      {successData && (
        <BookingSuccessModal
          requestId={successData.requestId}
          customerName={customerName}
          customerPhone={customerPhone}
          serviceName={selectedService}
          whatsappUrl={successData.whatsappUrl}
          phone={businessPhone}
          onClose={() => {
            setSuccessData(null);
            setDescription('');
            setAdditionalNotes('');
          }}
        />
      )}
    </div>
  );
}
