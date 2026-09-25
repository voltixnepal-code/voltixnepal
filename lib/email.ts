import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { generateInvoicePdfBuffer, InvoiceData } from './invoice-pdf';

export interface EmailPayload {
  requestId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  preferredContact: string;
  serviceName: string;
  urgency: string;
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
  billedAmount?: number | null;
  paidAmount?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  createdAt: Date;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'voltixnepal@gmail.com';
  const pass = process.env.SMTP_PASSWORD || 'giywifnxmcxgogkg';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Reusable HTML Email Footer with Official Social Contact Icons
 */
function getEmailFooterHtml(businessSettings?: { phone?: string; whatsappNumber?: string }) {
  const phone = businessSettings?.phone || '+977 9825870047';
  const whatsappNumber = (businessSettings?.whatsappNumber || '9779825870047').replace(/\D/g, '');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 20px; background-color: #f8fafc; text-align: center;">
      <!-- Social & Contact Icons Bar -->
      <tr>
        <td align="center" style="padding-bottom: 14px;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
            <tr>
              <!-- Phone -->
              <td style="padding: 0 6px;">
                <a href="tel:${phone.replace(/\s+/g, '')}" title="Call Voltix Nepal" style="display: inline-block; width: 34px; height: 34px; line-height: 34px; background-color: #fee2e2; border-radius: 50%; text-align: center; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" width="16" height="16" alt="Phone" style="vertical-align: middle; border: 0;" />
                </a>
              </td>
              <!-- WhatsApp -->
              <td style="padding: 0 6px;">
                <a href="https://wa.me/${whatsappNumber}" title="WhatsApp Us" style="display: inline-block; width: 34px; height: 34px; line-height: 34px; background-color: #dcfce7; border-radius: 50%; text-align: center; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" width="16" height="16" alt="WhatsApp" style="vertical-align: middle; border: 0;" />
                </a>
              </td>
              <!-- Facebook -->
              <td style="padding: 0 6px;">
                <a href="https://facebook.com/voltixnepal" title="Facebook Page" style="display: inline-block; width: 34px; height: 34px; line-height: 34px; background-color: #eff6ff; border-radius: 50%; text-align: center; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" width="16" height="16" alt="Facebook" style="vertical-align: middle; border: 0;" />
                </a>
              </td>
              <!-- Instagram -->
              <td style="padding: 0 6px;">
                <a href="https://instagram.com/voltixnepal" title="Instagram" style="display: inline-block; width: 34px; height: 34px; line-height: 34px; background-color: #fdf2f8; border-radius: 50%; text-align: center; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/3955/3955024.png" width="16" height="16" alt="Instagram" style="vertical-align: middle; border: 0;" />
                </a>
              </td>
              <!-- YouTube -->
              <td style="padding: 0 6px;">
                <a href="https://youtube.com/@voltixnepal" title="YouTube Channel" style="display: inline-block; width: 34px; height: 34px; line-height: 34px; background-color: #fef2f2; border-radius: 50%; text-align: center; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/3670/3670147.png" width="16" height="16" alt="YouTube" style="vertical-align: middle; border: 0;" />
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Company Details -->
      <tr>
        <td style="font-size: 12px; color: #475569; line-height: 1.6; padding: 0 20px 10px;">
          <strong style="color: #0f172a;">VoltixNepal Electrical Contracting & Services</strong><br/>
          Proprietor & Lead Electrician: Sanjit Mishra<br/>
          Kathmandu Valley, Bagmati Province, Nepal<br/>
          Helpline: <a href="tel:${phone.replace(/\s+/g, '')}" style="color: #dc2626; text-decoration: none; font-weight: 700;">${phone}</a> &nbsp;|&nbsp; 
          <a href="https://voltixnepal.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">voltixnepal.com</a>
        </td>
      </tr>
      <tr>
        <td style="font-size: 11px; color: #94a3b8; padding-bottom: 20px;">
          Certified electrical safety diagnostics, 24/7 breakdown emergency repair, and residential/commercial installations.
        </td>
      </tr>
    </table>
  `;
}

/**
 * Reusable Header with Official Voltix Nepal Logo
 */
function getEmailHeaderHtml(subtitle = 'Professional Electrical Services') {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 30px; border-bottom: 2px solid #f1f5f9; background-color: #ffffff;">
      <tr>
        <td>
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <img src="https://voltixnepal.com/logo-dark.png" alt="Voltix Nepal" height="38" style="height: 38px; width: auto; display: block; border: 0;" />
              </td>
            </tr>
          </table>
          <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${subtitle}
          </div>
        </td>
      </tr>
    </table>
  `;
}

/**
 * 1. ADMIN NOTIFICATION EMAIL
 */
export async function sendAdminNewRequestNotification(
  payload: EmailPayload,
  adminEmailOverride?: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"VoltixNepal Dispatch" <voltixnepal@gmail.com>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltixnepal.com';

  const defaultAdminRecipients = ['voltixnepal@gmail.com', 'bishaldev949@gmail.com'];
  const to = adminEmailOverride ? [adminEmailOverride] : defaultAdminRecipients;

  const mapLink =
    payload.googleMapsUrl ||
    (payload.latitude && payload.longitude
      ? `https://www.google.com/maps?q=${payload.latitude},${payload.longitude}`
      : null);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Service Request #${payload.requestId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          ${getEmailHeaderHtml('Dispatch & Operations Control')}

          <!-- Request Title Banner -->
          <tr>
            <td style="padding: 24px 30px 10px; background-color: #ffffff;">
              <div style="font-size: 12px; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">
                Incoming Order Notification [${payload.urgency}]
              </div>
              <h1 style="margin: 6px 0 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                New Service Request: <span style="color: #dc2626;">#${payload.requestId}</span>
              </h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: #475569; line-height: 1.5;">
                A customer has requested electrical service via VoltixNepal. Details are outlined below for technician dispatch.
              </p>
            </td>
          </tr>

          <!-- Customer Info Table -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin-top: 10px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b; width: 140px;">Customer Name:</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${payload.customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">Phone Number:</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #dc2626;">
                      <a href="tel:${payload.customerPhone}" style="color: #dc2626; text-decoration: none;">${payload.customerPhone}</a>
                    </td>
                  </tr>
                  ${payload.customerEmail ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">Email Address:</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                      <a href="mailto:${payload.customerEmail}" style="color: #2563eb; text-decoration: none;">${payload.customerEmail}</a>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">Preferred Contact:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #0f172a;">
                      ${payload.preferredContact}
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Service Requirements Table -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f1f5f9;">
                  <th colspan="2" style="padding: 10px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; text-align: left;">
                    Electrical Job Specifications
                  </th>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 140px;">Service:</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${payload.serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9;">Location:</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                    ${payload.address}${payload.area ? `, ${payload.area}` : ''}, ${payload.city || 'Kathmandu'}
                  </td>
                </tr>
                ${payload.preferredDate ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9;">Scheduled Date:</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                    ${payload.preferredDate} ${payload.preferredTime ? `(${payload.preferredTime})` : ''}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; vertical-align: top;">Description:</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #1e293b; line-height: 1.6;">
                    ${payload.description.replace(/\n/g, '<br/>')}
                  </td>
                </tr>
                ${payload.additionalNotes ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-top: 1px solid #f1f5f9;">Notes:</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9;">
                    ${payload.additionalNotes}
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 10px 30px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 4px;">
                    <a href="${appUrl}/admin/requests/${payload.requestId}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                      Open in Admin Panel ↗
                    </a>
                  </td>
                  <td style="padding: 4px;">
                    <a href="https://wa.me/${payload.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(payload.customerName)},%20VoltixNepal%20has%20received%20your%20service%20request%20%23${payload.requestId}." style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 20px; border-radius: 6px; text-decoration: none;">
                      WhatsApp Customer
                    </a>
                  </td>
                  ${mapLink ? `
                  <td style="padding: 4px;">
                    <a href="${mapLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 20px; border-radius: 6px; text-decoration: none;">
                      Map ↗
                    </a>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corporate Email Footer with Social Icons -->
          <tr>
            <td>
              ${getEmailFooterHtml()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `[${payload.urgency}] New Request #${payload.requestId}: ${payload.customerName} — ${payload.serviceName}`,
      html: htmlContent,
    });
    console.log(`[SMTP Success] Admin notification sent to ${to.join(', ')} for #${payload.requestId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[SMTP Error] Failed sending admin notification email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 2. CUSTOMER CONFIRMATION EMAIL
 */
export async function sendCustomerConfirmationEmail(
  payload: EmailPayload,
  businessSettings?: { phone?: string; whatsappNumber?: string; businessName?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!payload.customerEmail) {
    return { success: true };
  }

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"VoltixNepal" <voltixnepal@gmail.com>`;
  const businessPhone = businessSettings?.phone || '+977 9825870047';
  const whatsappNumber = businessSettings?.whatsappNumber || '9779825870047';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Request Received — VoltixNepal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          ${getEmailHeaderHtml('Order Confirmation & Booking Details')}

          <!-- Main Greeting -->
          <tr>
            <td style="padding: 24px 32px 10px;">
              <h1 style="margin: 0; font-size: 19px; font-weight: 800; color: #0f172a; line-height: 1.4;">
                Thank you, ${payload.customerName}!
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
                We have received your service request for <strong>${payload.serviceName}</strong>. Our electrical team led by <strong>Sanjit Mishra</strong> will contact you shortly to confirm technician dispatch.
              </p>
            </td>
          </tr>

          <!-- Booking Summary Card -->
          <tr>
            <td style="padding: 10px 32px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: collapse; overflow: hidden;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; width: 130px;">Request ID:</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #dc2626; font-family: monospace;">#${payload.requestId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Service Type:</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a;">${payload.serviceName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Urgency:</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: ${payload.urgency === 'EMERGENCY' ? '#dc2626' : '#0f172a'};">${payload.urgency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 500;">
                    ${payload.address}${payload.area ? `, ${payload.area}` : ''}, ${payload.city || 'Kathmandu'}
                  </td>
                </tr>
                ${payload.preferredDate ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Requested Date:</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600;">
                    ${payload.preferredDate} ${payload.preferredTime ? `(${payload.preferredTime})` : ''}
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Direct Emergency Contact CTAs -->
          <tr>
            <td style="padding: 0 32px 28px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 4px;">
                    <a href="tel:${businessPhone}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; text-decoration: none;">
                      Call: ${businessPhone}
                    </a>
                  </td>
                  <td style="padding: 4px;">
                    <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; text-decoration: none;">
                      WhatsApp Us
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with Social Icons -->
          <tr>
            <td>
              ${getEmailFooterHtml(businessSettings)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from,
      to: payload.customerEmail,
      subject: `Service Request Received #${payload.requestId} — VoltixNepal`,
      html: htmlContent,
    });
    console.log(`[SMTP Success] Confirmation email sent to customer ${payload.customerEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error('[SMTP Error] Failed sending customer confirmation email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. CUSTOMER STATUS UPDATE EMAIL
 */
export async function sendStatusUpdateEmail(
  request: {
    requestId: string;
    customerName: string;
    customerEmail?: string | null;
    serviceName: string;
    status: string;
    internalNotes?: string | null;
    adminAssigned?: string | null;
    address: string;
  },
  businessSettings?: { phone?: string; whatsappNumber?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!request.customerEmail) {
    return { success: true };
  }

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"VoltixNepal Service" <voltixnepal@gmail.com>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltixnepal.com';
  const businessPhone = businessSettings?.phone || '+977 9825870047';
  const trackingUrl = `${appUrl}/track?code=${encodeURIComponent(request.requestId)}`;

  const statusDisplayMap: Record<string, { label: string; desc: string }> = {
    NEW: { label: 'Request Received', desc: 'Your request has been received and is awaiting technician dispatch review.' },
    CONTACTED: { label: 'Technician Contacted', desc: 'Our team has reached out to verify service details and timing.' },
    CONFIRMED: { label: 'Order Confirmed', desc: 'Your service appointment is confirmed. Technician is scheduled.' },
    IN_PROGRESS: { label: 'Technician Dispatched / In Progress', desc: 'Technician is actively en-route or performing electrical work on-site.' },
    COMPLETED: { label: 'Work Completed & Verified', desc: 'Electrical service work has been completed and safety tested.' },
    CANCELLED: { label: 'Cancelled', desc: 'This service request was cancelled.' },
  };

  const currentStatus = statusDisplayMap[request.status] || {
    label: request.status,
    desc: 'Status updated by VoltixNepal administration.',
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Request #${request.requestId} Status Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          ${getEmailHeaderHtml('Service Status & Tracking')}

          <!-- Main Status Info -->
          <tr>
            <td style="padding: 24px 30px 10px;">
              <div style="font-size: 12px; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">
                Status Update: ${currentStatus.label}
              </div>
              <h1 style="margin: 6px 0 0; font-size: 19px; font-weight: 800; color: #0f172a;">
                Hello ${request.customerName}, your service order #${request.requestId} was updated:
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #334155; line-height: 1.5;">
                ${currentStatus.desc}
              </p>
            </td>
          </tr>

          <!-- Technician & Details Card -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b; width: 140px;">Service:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${request.serviceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">Current Status:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${currentStatus.label}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">Assigned Electrician:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      ${request.adminAssigned || 'Sanjit Mishra (Lead Electrician)'}
                    </td>
                  </tr>
                  ${request.internalNotes ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b; vertical-align: top;">Work Note:</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #334155;">${request.internalNotes}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </td>
          </tr>

          <!-- Track Online CTA Button -->
          <tr>
            <td style="padding: 0 30px 24px; text-align: center;">
              <a href="${trackingUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 6px; text-decoration: none;">
                Track Service Live Online ↗
              </a>
              <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                You can also track anytime by entering code <strong style="color: #0f172a;">${request.requestId}</strong> on voltixnepal.com/track
              </div>
            </td>
          </tr>

          <!-- Footer with Social Icons -->
          <tr>
            <td>
              ${getEmailFooterHtml(businessSettings)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from,
      to: request.customerEmail,
      subject: `[Update] Service Request #${request.requestId}: ${currentStatus.label} — VoltixNepal`,
      html: htmlContent,
    });
    console.log(`[SMTP Success] Status update email sent to ${request.customerEmail} for #${request.requestId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[SMTP Error] Failed sending status update email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. CUSTOMER PAYMENT RECEIPT & INVOICE EMAIL (WITH ATTACHED PDF)
 */
export async function sendPaymentInvoiceEmail(
  data: {
    requestId: string;
    customerName: string;
    customerEmail?: string | null;
    customerPhone: string;
    customerAddress: string;
    serviceName: string;
    description: string;
    billedAmount: number;
    paidAmount: number;
    paymentStatus: string;
    paymentMethod?: string | null;
    paymentNotes?: string | null;
    adminAssigned?: string | null;
    paidAt?: Date | null;
  },
  businessSettings?: { phone?: string; whatsappNumber?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!data.customerEmail) {
    return { success: true };
  }

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"VoltixNepal Accounts" <voltixnepal@gmail.com>`;
  const invoiceNumber = `INV-${data.requestId}`;

  const formattedBilled = (data.billedAmount || data.paidAmount || 0).toLocaleString('en-IN');
  const formattedPaid = (data.paidAmount || 0).toLocaleString('en-IN');
  const balanceDue = Math.max(0, (data.billedAmount || 0) - (data.paidAmount || 0));

  let pdfAttachment: Buffer | null = null;
  try {
    pdfAttachment = await generateInvoicePdfBuffer({
      invoiceNumber,
      requestId: data.requestId,
      date: new Date(),
      paidAt: data.paidAt,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerAddress: data.customerAddress,
      serviceName: data.serviceName,
      description: data.description,
      billedAmount: data.billedAmount,
      paidAmount: data.paidAmount,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      paymentNotes: data.paymentNotes,
      adminAssigned: data.adminAssigned,
    });
  } catch (pdfErr) {
    console.error('Error generating PDF invoice buffer:', pdfErr);
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt & Invoice #${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          ${getEmailHeaderHtml('Official Tax Invoice & Payment Receipt')}

          <!-- Title Banner -->
          <tr>
            <td style="padding: 24px 30px 10px;">
              <div style="font-size: 12px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">
                Payment Confirmation (${data.paymentStatus === 'PAID' ? 'Fully Paid' : 'Payment Received'})
              </div>
              <h1 style="margin: 6px 0 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                Invoice #${invoiceNumber}
              </h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: #334155; line-height: 1.5;">
                Dear <strong>${data.customerName}</strong>, thank you for your payment for electrical services. A copy of your official PDF tax invoice is attached to this email.
              </p>
            </td>
          </tr>

          <!-- Invoice Summary Table -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  <tr style="background-color: #0f172a; color: #ffffff;">
                    <th style="padding: 10px 16px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: left;">Item Description</th>
                    <th style="padding: 10px 16px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: right;">Amount (NPR)</th>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a;">
                      ${data.serviceName}
                      <div style="font-size: 11px; font-weight: 400; color: #64748b; margin-top: 2px;">
                        Request #${data.requestId} • Technician: ${data.adminAssigned || 'Sanjit Mishra'}
                      </div>
                    </td>
                    <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">
                      Rs. ${formattedBilled}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 16px; font-size: 13px; color: #475569;">Amount Paid:</td>
                    <td style="padding: 10px 16px; font-size: 14px; font-weight: 700; color: #16a34a; text-align: right;">
                      Rs. ${formattedPaid} (${data.paymentMethod || 'Cash'})
                    </td>
                  </tr>
                  ${balanceDue > 0 ? `
                  <tr style="background-color: #fef2f2;">
                    <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #dc2626;">Remaining Balance:</td>
                    <td style="padding: 10px 16px; font-size: 14px; font-weight: 700; color: #dc2626; text-align: right;">
                      Rs. ${balanceDue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  ` : `
                  <tr style="background-color: #f0fdf4;">
                    <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #16a34a;">Settlement Status:</td>
                    <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #16a34a; text-align: right;">
                      ✓ All Dues Cleared
                    </td>
                  </tr>
                  `}
                </table>
              </div>
            </td>
          </tr>

          ${data.paymentNotes ? `
          <tr>
            <td style="padding: 0 30px 15px;">
              <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #475569;">
                <strong style="color: #0f172a;">Payment Note:</strong> ${data.paymentNotes}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- PDF Attachment Info Box -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; text-align: center;">
                <div style="font-size: 13px; font-weight: 700; color: #1e40af;">
                  📄 Official PDF Invoice Attached
                </div>
                <div style="font-size: 12px; color: #3b82f6; margin-top: 2px;">
                  Download or print the attached PDF file for your official tax and warranty records.
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer with Social Icons -->
          <tr>
            <td>
              ${getEmailFooterHtml(businessSettings)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const mailOptions: any = {
      from,
      to: data.customerEmail,
      subject: `[Payment Receipt] Invoice #${invoiceNumber} — VoltixNepal`,
      html: htmlContent,
    };

    if (pdfAttachment) {
      mailOptions.attachments = [
        {
          filename: `VoltixNepal-Invoice-${data.requestId}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf',
        },
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP Success] Payment invoice email sent to ${data.customerEmail} with PDF for #${data.requestId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[SMTP Error] Failed sending payment invoice email:', err);
    return { success: false, error: err.message };
  }
}
