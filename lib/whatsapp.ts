export interface WhatsAppPayloadParams {
  requestId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  serviceName: string;
  urgency?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  description: string;
  address: string;
  area?: string | null;
  city?: string | null;
  googleMapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  additionalNotes?: string | null;
}

export function generateWhatsAppMessage(data: WhatsAppPayloadParams): string {
  const mapLink =
    data.googleMapsUrl ||
    (data.latitude && data.longitude
      ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
      : 'Not provided');

  const lines = [
    `*NEW SERVICE REQUEST — VOLTIXNEPAL*`,
    data.requestId ? `*Request ID:* ${data.requestId}` : null,
    `--------------------------------`,
    `*Customer:* ${data.customerName}`,
    `*Phone:* ${data.customerPhone}`,
    data.customerEmail ? `*Email:* ${data.customerEmail}` : null,
    `*Service:* ${data.serviceName}`,
    `*Urgency:* ${data.urgency || 'NORMAL'}`,
    data.preferredDate ? `*Preferred Date:* ${data.preferredDate}` : null,
    data.preferredTime ? `*Preferred Time:* ${data.preferredTime}` : null,
    `--------------------------------`,
    `*Problem / Details:*`,
    `${data.description}`,
    `--------------------------------`,
    `*Address:* ${data.address}`,
    data.area ? `*Area / Tole:* ${data.area}` : null,
    data.city ? `*City:* ${data.city}` : null,
    mapLink !== 'Not provided' ? `*Google Maps:* ${mapLink}` : null,
    data.additionalNotes ? `*Additional Notes:* ${data.additionalNotes}` : null,
    `--------------------------------`,
    `*VoltixNepal - Sanjeet Mishra (Electrician)*`,
  ].filter(Boolean);

  return lines.join('\n');
}

export function generateWhatsAppUrl(
  whatsappNumber: string,
  data: WhatsAppPayloadParams
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const message = generateWhatsAppMessage(data);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
