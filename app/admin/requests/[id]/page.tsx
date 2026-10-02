'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  Navigation,
  ExternalLink,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  ScanSearch,
  Wallet,
  Receipt,
  DollarSign,
  History,
  Check,
  XCircle,
  X,
  Radio,
  Bike,
  Compass,
  Globe,
  Share2,
  ChevronDown,
  ChevronUp,
  FileDown,
  BellRing,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { StatusBadge, UrgencyBadge } from '@/components/admin/StatusBadge';
import { CustomerLoyaltyBadge, PaymentBadge } from '@/components/admin/CustomerLoyaltyBadge';
import { adminFetch } from '@/lib/admin-fetch';

const LiveTrackingMap = dynamic(() => import('@/components/maps/LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
      Loading interactive dispatch map...
    </div>
  ),
});

export default function AdminRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [request, setRequest] = useState<any>(null);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [status, setStatus] = useState('NEW');
  const [internalNotes, setInternalNotes] = useState('');
  const [adminAssigned, setAdminAssigned] = useState('Sanjit Mishra');

  // Real GPS & Live Ride State
  const [rideStarted, setRideStarted] = useState(false);
  const [technicianLat, setTechnicianLat] = useState<number | null>(null);
  const [technicianLng, setTechnicianLng] = useState<number | null>(null);
  const [technicianHeading, setTechnicianHeading] = useState<number | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const watchIdRef = React.useRef<number | null>(null);

  // Financial & Billing State
  const [billedAmount, setBilledAmount] = useState<number | string>('');
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState<string>('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccessMsg, setReminderSuccessMsg] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('Our technicians are fully booked today.');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const router = useRouter();

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/requests/${params.id}`);
      if (res.ok && res.data?.success && res.data?.request) {
        const req = res.data.request;
        setRequest(req);
        setCustomerHistory(res.data.customerHistory || []);
        setStatus(req.status);
        setInternalNotes(req.internalNotes || '');
        setAdminAssigned(req.adminAssigned || 'Sanjit Mishra');

        setRideStarted(Boolean(req.rideStarted));
        setTechnicianLat(req.technicianLat || null);
        setTechnicianLng(req.technicianLng || null);
        setTechnicianHeading(req.technicianHeading || null);

        setBilledAmount(req.billedAmount || '');
        setPaidAmount(req.paidAmount || '');
        setPaymentStatus(req.paymentStatus || 'UNPAID');
        setPaymentMethod(req.paymentMethod || 'CASH');
        setPaymentNotes(req.paymentNotes || '');
        setPaymentDueDate(req.paymentDueDate ? new Date(req.paymentDueDate).toISOString().split('T')[0] : '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Start Real GPS Broadcast via watchPosition
  const startGpsBroadcast = () => {
    if (!navigator.geolocation) {
      setBroadcastStatus('Geolocation is not supported on this device/browser.');
      return;
    }

    setBroadcastStatus('Connecting to device GPS satellites...');
    setIsBroadcasting(true);

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const heading = pos.coords.heading || null;

        setTechnicianLat(lat);
        setTechnicianLng(lng);
        setTechnicianHeading(heading);
        setBroadcastStatus(`Broadcasting Real GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

        // Stream coordinates to live endpoint
        try {
          await adminFetch(`/api/requests/${params.id}/live-location`, {
            method: 'POST',
            body: JSON.stringify({
              technicianLat: lat,
              technicianLng: lng,
              technicianHeading: heading,
              rideStarted: true,
            }),
          });
        } catch (err) {
          console.error('Failed to post live coordinates:', err);
        }
      },
      (err) => {
        setBroadcastStatus(`GPS Error: ${err.message}`);
        setIsBroadcasting(false);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    watchIdRef.current = id;
  };

  const stopGpsBroadcast = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsBroadcasting(false);
    setRideStarted(false);
    setBroadcastStatus('Ride stopped. Real GPS broadcasting paused.');

    try {
      await adminFetch(`/api/requests/${params.id}/live-location`, {
        method: 'POST',
        body: JSON.stringify({
          rideStarted: false,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRide = async () => {
    if (!rideStarted) {
      const initialLat =
        technicianLat ||
        request?.technicianLat ||
        (request?.latitude ? request.latitude + 0.003 : 27.700769);
      const initialLng =
        technicianLng ||
        request?.technicianLng ||
        (request?.longitude ? request.longitude + 0.003 : 85.312329);

      setRideStarted(true);
      setTechnicianLat(initialLat);
      setTechnicianLng(initialLng);
      setStatus('IN_PROGRESS');
      setBroadcastStatus('Ride started! Live map connected. Acquiring device GPS...');

      // Immediately alert server so customer receives ride-started email without delay
      try {
        await adminFetch(`/api/requests/${params.id}/live-location`, {
          method: 'POST',
          body: JSON.stringify({
            rideStarted: true,
            technicianLat: initialLat,
            technicianLng: initialLng,
          }),
        });
        setBroadcastStatus('Ride active! Customer notified by email. Live GPS streaming...');
      } catch (err) {
        console.error('Failed to notify backend of ride start:', err);
      }

      startGpsBroadcast();
    } else {
      await stopGpsBroadcast();
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  // Periodic polling for live location updates from technician
  useEffect(() => {
    if (!params.id || isBroadcasting) return;

    const interval = setInterval(async () => {
      try {
        const res = await adminFetch(`/api/requests/${params.id}/live-location`);
        if (res.ok && res.data?.success && res.data?.data) {
          const live = res.data.data;
          setRideStarted(Boolean(live.rideStarted));
          if (live.technicianLat != null) setTechnicianLat(live.technicianLat);
          if (live.technicianLng != null) setTechnicianLng(live.technicianLng);
          if (live.technicianHeading != null) setTechnicianHeading(live.technicianHeading);
        }
      } catch (e) {
        // silent
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [params.id, isBroadcasting]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await adminFetch(`/api/requests/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          internalNotes,
          adminAssigned,
          billedAmount: billedAmount === '' ? 0 : Number(billedAmount),
          paidAmount: paidAmount === '' ? 0 : Number(paidAmount),
          paymentStatus,
          paymentMethod,
          paymentNotes,
          paymentDueDate: paymentDueDate || null,
        }),
      });

      if (res.ok && res.data?.success) {
        setRequest(res.data.request);
        setStatusMsg('Request & billing details updated successfully.');
      } else {
        throw new Error(res.error || 'Failed to update request.');
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptOrder = async () => {
    setDeciding(true);
    setStatusMsg(null);
    try {
      const res = await adminFetch(`/api/requests/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'ACCEPT',
          status: 'CONFIRMED',
          adminAssigned: adminAssigned || 'Sanjit Mishra',
        }),
      });

      if (res.ok && res.data?.success) {
        setRequest(res.data.request);
        setStatus('CONFIRMED');
        setStatusMsg('✓ Order Accepted & Confirmed! Confirmation email sent to customer.');
      } else {
        throw new Error(res.error || 'Failed to accept order.');
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setDeciding(false);
    }
  };

  const handleDeclineOrder = async () => {
    setDeciding(true);
    setStatusMsg(null);
    try {
      const res = await adminFetch(`/api/requests/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'DECLINE',
          status: 'CANCELLED',
          declineReason: declineReason || 'Our technicians are fully booked today.',
        }),
      });

      if (res.ok && res.data?.success) {
        setRequest(res.data.request);
        setStatus('CANCELLED');
        setShowDeclineModal(false);
        setStatusMsg('Order Declined. Notice email sent to customer.');
      } else {
        throw new Error(res.error || 'Failed to decline order.');
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setDeciding(false);
    }
  };

  const handleMarkFullPaid = () => {
    const amount = Number(billedAmount) || Number(paidAmount) || 0;
    if (amount > 0) {
      setPaidAmount(amount);
      setPaymentStatus('PAID');
    } else {
      setPaymentStatus('PAID');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service request?')) return;
    try {
      const res = await adminFetch(`/api/requests/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok && res.data?.success) {
        router.push('/admin/requests');
      } else {
        alert(res.error || 'Failed to delete request.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading request details...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900">Request Not Found</h2>
        <Link href="/admin/requests" className="btn-secondary text-xs">
          Back to All Requests
        </Link>
      </div>
    );
  }

  const mapLink =
    request.googleMapsUrl ||
    (request.latitude && request.longitude
      ? `https://www.google.com/maps?q=${request.latitude},${request.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${request.address}, ${request.city}`
        )}`);

  const directionsLink =
    request.latitude && request.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${request.address}, ${request.city}`
        )}`;

  const customerWhatsAppNumber = request.customerPhone.replace(/[^0-9]/g, '');
  const customerWhatsAppLink = `https://wa.me/${customerWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${request.customerName}, this is Sanjit Mishra from VoltixNepal regarding your electrical service request #${request.requestId}.`
  )}`;

  const balanceDue = Math.max(0, Number(billedAmount || 0) - Number(paidAmount || 0));

  const paymentReminderWhatsAppLink = `https://wa.me/${customerWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${request.customerName}, this is Sanjit Mishra from VoltixNepal.\n\nThis is a friendly payment reminder regarding your Invoice #${request.requestId}.\n• Total Billed: Rs. ${Number(billedAmount || 0).toLocaleString('en-IN')}\n• Paid: Rs. ${Number(paidAmount || 0).toLocaleString('en-IN')}\n• Remaining Due: Rs. ${balanceDue.toLocaleString('en-IN')}${paymentDueDate ? `\n• Due Date: ${paymentDueDate}` : ''}\n\nFast Payment Methods:\n• eSewa / Khalti ID: 9825870047 (Sanjit Mishra)\n• FonePay: 9825870047\n\nPlease share your payment screenshot once transferred. Thank you!`
  )}`;

  const handleSendPaymentReminder = async () => {
    if (!request?.customerEmail) {
      alert('This customer does not have an email address on file. Please send the reminder via WhatsApp.');
      return;
    }
    setSendingReminder(true);
    setReminderSuccessMsg(null);
    try {
      const res = await adminFetch(`/api/requests/${params.id}/send-payment-reminder`, {
        method: 'POST',
      });
      if (res.ok && res.data?.success) {
        setReminderSuccessMsg(res.data.message || 'Payment reminder & PDF invoice sent successfully!');
        fetchRequest();
      } else {
        alert(res.data?.message || 'Failed to send payment reminder.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send payment reminder.');
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Requests</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/track?code=${request?.requestId}`}
            target="_blank"
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            <span>Customer Track Preview</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={handleDelete}
            className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-md text-xs flex items-center gap-2 ${
            statusMsg.startsWith('Error')
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {statusMsg.startsWith('Error') ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 1. Order Decision Action Bar (Accept / Decline) */}
      {status === 'NEW' || status === 'CONTACTED' ? (
        <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                New Order Received • Action Required
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Accept or Decline this Service Request
            </h2>
            <p className="text-xs text-slate-500">
              Accepting confirms the booking and sends a confirmation email with tracking to <strong>{request.customerName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleAcceptOrder}
              disabled={deciding}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {deciding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Accept Order</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeclineModal(true)}
              disabled={deciding}
              className="bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 font-semibold py-2 px-4 rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Decline Order</span>
            </button>
          </div>
        </div>
      ) : status === 'CONFIRMED' ? (
        <div className="bg-white rounded-lg border border-emerald-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Order Accepted & Confirmed
              </div>
              <p className="text-xs text-slate-500">
                Customer was notified by email. Assigned technician: <strong>{adminAssigned || 'Sanjit Mishra'}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeclineModal(true)}
            className="text-xs text-red-600 hover:text-red-700 font-medium px-2.5 py-1 rounded hover:bg-red-50 transition-colors self-start sm:self-auto"
          >
            Cancel / Decline Order
          </button>
        </div>
      ) : status === 'CANCELLED' ? (
        <div className="bg-white rounded-lg border border-red-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-red-600 text-white flex items-center justify-center shrink-0">
              <X className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Order Declined / Cancelled
              </div>
              <p className="text-xs text-slate-500">
                Customer was notified via email.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAcceptOrder}
            disabled={deciding}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Re-Open & Accept</span>
          </button>
        </div>
      ) : null}

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm">
                Decline Service Request
              </h3>
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Declining will cancel this request and send an email notification to <strong>{request.customerName}</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Reason for Customer:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  'Our technicians are fully booked today.',
                  'Requested location is outside our current service radius.',
                  'Specialized parts or equipment required are unavailable.',
                  'Customer requested to cancel.',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setDeclineReason(reason)}
                    className={`text-left p-2 rounded text-xs transition-colors border ${
                      declineReason === reason
                        ? 'border-red-500 bg-red-50/50 text-red-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Or type custom reason..."
                className="form-input text-xs w-full mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDeclineOrder}
                disabled={deciding}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-1.5 px-4 rounded flex items-center gap-1.5"
              >
                {deciding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                <span>Decline & Send Mail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Request Content & Dispatch Controls */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left (8 cols on desktop) */}
        <div className="contents lg:flex lg:flex-col lg:col-span-8 space-y-6 w-full">
          {/* 1. Header Card (order-1 on mobile) */}
          <div className="order-1 lg:order-none bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                    {request.requestId}
                  </span>
                  <CustomerLoyaltyBadge count={request.customerRequestCount} />
                  <UrgencyBadge urgency={request.urgency} />
                  <StatusBadge status={request.status} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-2">
                  {request.serviceName}
                </h1>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div>Received on</div>
                <div className="font-semibold text-slate-700">
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Problem / Requirement Description
              </h2>
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                {request.description}
              </div>
            </div>

            {request.additionalNotes && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Customer Additional Notes
                </h3>
                <p className="text-xs text-slate-700 italic">
                  "{request.additionalNotes}"
                </p>
              </div>
            )}
          </div>

          {/* 4. Real Location, Dispatch & Live GPS Ride Controls (order-4 on mobile) */}
          <div className="order-4 lg:order-none bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Customer Location & Live Dispatch
                </h3>
              </div>

              {request.latitude && request.longitude && (
                <span className="text-[10px] sm:text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold shrink-0">
                  <Compass className="w-3 h-3 text-emerald-600" />
                  <span>GPS: {request.latitude.toFixed(5)}, {request.longitude.toFixed(5)}</span>
                </span>
              )}
            </div>

            {/* Location & IP Details Grid - Compact 1-row side-by-side */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">
                  Verified Place & Street Address
                </span>
                <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate mt-0.5">
                  {request.customerLocationName && (
                    <span className="text-red-700 mr-1 font-bold">[{request.customerLocationName}]</span>
                  )}
                  {request.address}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                  Area: {request.area || 'Kathmandu Valley'} | City: {request.city}
                </div>
              </div>

              <div className="col-span-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">
                    Booking IP
                  </span>
                  <div className="font-mono font-bold text-slate-800 text-[11px] sm:text-xs flex items-center gap-1 mt-0.5 truncate">
                    <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{request.ipAddress || 'Not recorded'}</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  ISP Verified
                </div>
              </div>
            </div>

            {/* Technician Live Ride Dispatch Controller Banner - Clean Normal Human Made Style */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Bike className={`w-4 h-4 shrink-0 ${rideStarted ? 'text-red-600' : 'text-slate-600'}`} />
                    <span className="text-xs font-bold text-slate-800">
                      {rideStarted ? 'Live Ride Active (Technician Dispatched)' : 'Technician Dispatch Standby'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      rideStarted ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {rideStarted ? 'Active' : 'Standby'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {rideStarted
                      ? 'Broadcasting real GPS to customer tracking page'
                      : 'Click to start technician ride and broadcast GPS'}
                  </div>

                  {broadcastStatus && (
                    <div className="text-[10px] text-slate-700 font-mono truncate mt-0.5">
                      {broadcastStatus}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleToggleRide}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 ${
                    rideStarted
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>{rideStarted ? 'Stop Ride' : 'Start Ride'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Live Map in Admin */}
            {request.latitude && request.longitude && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-bold flex items-center gap-1.5 text-slate-800">
                    <Radio className="w-3.5 h-3.5 text-slate-700" />
                    <span>Live Dispatch & Road Route Map</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Auto-calculates turn-by-turn road driving route & ETA
                  </span>
                </div>

                <LiveTrackingMap
                  customerLat={request.latitude}
                  customerLng={request.longitude}
                  customerLocationName={request.customerLocationName}
                  customerAddress={request.address}
                  technicianLat={technicianLat}
                  technicianLng={technicianLng}
                  technicianHeading={technicianHeading}
                  technicianName={adminAssigned}
                  rideStarted={rideStarted}
                  height="360px"
                />
              </div>
            )}

            {/* External Navigation Shortcuts */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={directionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 5. Dedicated Financial Billing & Payment Card (order-5 on mobile - LAST!) */}
          <div className="order-5 lg:order-none space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Customer Payment & Billing
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Track what the customer paid, amount charged, and payment method
                    </p>
                  </div>
                </div>

                <PaymentBadge
                  status={paymentStatus}
                  amount={Number(paidAmount) || Number(billedAmount)}
                  method={paymentMethod}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs font-bold text-slate-700">
                    Total Billed Amount (NPR / Rs.)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={billedAmount}
                      onChange={(e) => setBilledAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="form-input pl-10 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs font-bold text-slate-700">
                    Amount Paid / Received (NPR / Rs.)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="form-input pl-10 text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs font-bold text-slate-700">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="form-input text-xs font-bold mt-1 bg-white"
                  >
                    <option value="UNPAID">UNPAID (Pending Payment)</option>
                    <option value="PAID">PAID (Full Payment Cleared)</option>
                    <option value="PARTIAL">PARTIAL (Advance / Deposit)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs font-bold text-slate-700">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-input text-xs font-semibold mt-1 bg-white"
                  >
                    <option value="CASH">Cash in Hand</option>
                    <option value="ESEWA">eSewa</option>
                    <option value="KHALTI">Khalti</option>
                    <option value="FONEPAY">Fonepay QR</option>
                    <option value="BANK_TRANSFER">Bank Transfer / ConnectIPS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold text-slate-700">
                  Payment & Receipt Notes / Reference ID
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via eSewa Txn# 9825870047, parts cost included Rs. 400"
                  className="form-input text-xs mt-1"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Payment Due Date</span>
                  <span className="text-slate-400 font-normal text-[11px]">(For Outstanding Dues)</span>
                </label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="form-input text-xs font-medium mt-1 bg-white"
                />
              </div>

              {/* Outstanding Balance & Automated 2-Day Reminder Notice */}
              {balanceDue > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Due: Rs. {balanceDue.toLocaleString('en-IN')}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Auto 2-Day Reminders Active
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-800">
                    {request.lastReminderSentAt ? (
                      <>
                        Last reminder sent: <strong>{new Date(request.lastReminderSentAt).toLocaleDateString()} at {new Date(request.lastReminderSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({request.reminderCount} sent so far).
                      </>
                    ) : (
                      <>No manual reminder sent yet. System automatically emails PDF tax invoices & payment reminders every 48 hours until settled.</>
                    )}
                  </p>

                  {reminderSuccessMsg && (
                    <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 p-2 rounded border border-emerald-200">
                      ✓ {reminderSuccessMsg}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSendPaymentReminder}
                      disabled={sendingReminder || !request.customerEmail}
                      className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{sendingReminder ? 'Sending PDF...' : 'Email Invoice & Reminder (PDF)'}</span>
                    </button>

                    <a
                      href={paymentReminderWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Reminder</span>
                    </a>

                    <a
                      href={`/api/requests/${params.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF Invoice</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Quick Helper Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="text-xs">
                  {balanceDue > 0 ? (
                    <span className="text-red-600 font-bold">
                      Remaining Unpaid Balance: Rs. {balanceDue.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> No Pending Balance
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {balanceDue === 0 && (
                    <a
                      href={`/api/requests/${params.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF Invoice</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleMarkFullPaid}
                    className="text-xs px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors"
                  >
                    Mark Full Payment Received
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Booking History (Repeat Client Record) */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Customer Service History with VoltixNepal
                  </h3>
                </div>
                <CustomerLoyaltyBadge count={request.customerRequestCount} />
              </div>

              {customerHistory.length <= 1 ? (
                <p className="text-xs text-slate-500">
                  This is the customer's 1st registered service booking with Voltix Nepal.
                </p>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {customerHistory.length > 2 && !showAllHistory ? (
                        <>Showing latest <strong>2</strong> of <strong>{customerHistory.length}</strong> service requests:</>
                      ) : (
                        <>Total <strong>{customerHistory.length}</strong> service requests recorded:</>
                      )}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {(showAllHistory ? customerHistory : customerHistory.slice(0, 2)).map((hist) => (
                      <div
                        key={hist.id}
                        className={`p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3 ${
                          hist.id === request.id ? 'bg-red-50/40 font-semibold' : 'bg-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-red-600 font-bold whitespace-nowrap text-xs">
                            {hist.requestId}
                          </div>
                          <div className="text-slate-800 text-xs truncate">
                            {hist.serviceName}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <PaymentBadge
                            status={hist.paymentStatus}
                            amount={hist.paidAmount || hist.billedAmount}
                            method={hist.paymentMethod}
                          />
                          <StatusBadge status={hist.status} />
                          {hist.id !== request.id && (
                            <Link
                              href={`/admin/requests/${hist.id}`}
                              className="btn-secondary text-[11px] py-1 px-2"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {customerHistory.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {showAllHistory ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Show More ({customerHistory.length - 2} more)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right (4 cols on desktop, 2-col side-by-side on mobile phone) */}
        <div className="order-2 lg:order-none lg:col-span-4 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:space-y-6 lg:gap-0 w-full items-start">
            {/* 2. Customer Contact Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 lg:p-6 shadow-sm space-y-3 h-full">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Customer Contact
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {request.customerName}
                      </span>
                      <CustomerLoyaltyBadge count={request.customerRequestCount} />
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500">
                      Prefers {request.preferredContact}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <a
                    href={`tel:${request.customerPhone}`}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] sm:text-xs transition-colors"
                  >
                    <Phone className="w-3 h-3 text-red-600 shrink-0" />
                    <span className="truncate">Call {request.customerPhone}</span>
                  </a>

                  <a
                    href={customerWhatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] sm:text-xs transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 fill-current shrink-0" />
                    <span className="truncate">WhatsApp Chat</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>

                  {request.customerEmail && (
                    <a
                      href={`mailto:${request.customerEmail}?subject=VoltixNepal%20Service%20Request%20%23${request.requestId}`}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-[11px] sm:text-xs transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">Send Email</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Status & Assignment Box */}
            <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 lg:p-6 shadow-sm space-y-3 h-full">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Update Request & Save
              </h3>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="form-label text-[11px] sm:text-xs mb-1">Job Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-input text-xs py-1.5 px-2 bg-white font-semibold"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="form-label text-[11px] sm:text-xs mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={adminAssigned}
                    onChange={(e) => setAdminAssigned(e.target.value)}
                    className="form-input text-xs py-1.5 px-2"
                  />
                </div>

                <div>
                  <label className="form-label text-[11px] sm:text-xs mb-1">Internal Notes / Log</label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g. Visited site at 10 AM..."
                    className="form-input text-xs py-1.5 px-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Floating Actions (Easy 1-tap call, whatsapp, accept/decline on phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <a
            href={`tel:${request.customerPhone}`}
            className="p-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center justify-center shrink-0 border border-slate-200 active:scale-95 transition-transform"
            title="Call Customer"
          >
            <Phone className="w-5 h-5 text-red-600" />
          </a>
          <a
            href={customerWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform"
            title="WhatsApp Customer"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
          </a>

          {status === 'NEW' || status === 'CONTACTED' ? (
            <>
              <button
                type="button"
                onClick={handleAcceptOrder}
                disabled={deciding}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                {deciding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeclineModal(true)}
                disabled={deciding}
                className="bg-rose-50 border border-rose-300 text-rose-700 font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1 active:scale-98"
              >
                <XCircle className="w-4 h-4" />
                <span>Decline</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-primary py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
