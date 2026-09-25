import nodemailer from 'nodemailer';

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
 * 1. ADMIN NOTIFICATION EMAIL
 * Sent immediately to voltixnepal@gmail.com and bishaldev949@gmail.com
 * Corporate enterprise style (Google / Stripe aesthetic)
 */
export async function sendAdminNewRequestNotification(
  payload: EmailPayload,
  adminEmailOverride?: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"VoltixNepal Dispatch" <voltixnepal@gmail.com>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Send to both primary admins
  const defaultAdminRecipients = ['voltixnepal@gmail.com', 'bishaldev949@gmail.com'];
  const to = adminEmailOverride ? [adminEmailOverride] : defaultAdminRecipients;

  const mapLink =
    payload.googleMapsUrl ||
    (payload.latitude && payload.longitude
      ? `https://www.google.com/maps?q=${payload.latitude},${payload.longitude}`
      : null);

  const urgencyColor =
    payload.urgency === 'EMERGENCY'
      ? '#DC2626'
      : payload.urgency === 'URGENT'
      ? '#D97706'
      : '#2563EB';

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
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          <!-- Corporate Brand Header (Clean White / Accent Border) -->
          <tr>
            <td style="padding: 24px 30px; border-bottom: 2px solid #f1f5f9; background-color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1;">
                      Voltix<span style="color: #dc2626;">Nepal</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Dispatch & Operations Control
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: ${urgencyColor}; background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 20px; text-transform: uppercase;">
                      ● ${payload.urgency}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Request Title Banner -->
          <tr>
            <td style="padding: 24px 30px 10px; background-color: #ffffff;">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                Incoming Order Notification
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

          <!-- Action Buttons (Google Style Pill Buttons) -->
          <tr>
            <td style="padding: 10px 30px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 4px;">
                    <a href="${appUrl}/admin/requests/${payload.requestId}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 6px; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
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

          <!-- Corporate Email Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center;">
              <div style="font-weight: 600; color: #475569;">
                VoltixNepal Electrical Services • Sanjit Mishra
              </div>
              <div>Kathmandu Valley, Bagmati Province, Nepal • Phone: +977 9825870047</div>
              <div style="margin-top: 4px; color: #94a3b8;">
                This is an automated operational alert sent to authorized administrators.
              </div>
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
 * 2. CUSTOMER CONFIRMATION & RECEIPT EMAIL
 * Clean, trustworthy corporate receipt template (like Google / Stripe / Apple Store)
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
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1;">
                      Voltix<span style="color: #dc2626;">Nepal</span>
                    </div>
                    <div style="font-size: 12px; font-weight: 500; color: #64748b; margin-top: 4px;">
                      Professional Electrical Services • Sanjit Mishra
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #16a34a; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                      ✓ Received
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Greeting -->
          <tr>
            <td style="padding: 24px 32px 10px;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.4;">
                Thank you, ${payload.customerName}!
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
                We have received your service request for <strong>${payload.serviceName}</strong>. Our electrician team will contact you shortly to confirm technician arrival schedule.
              </p>
            </td>
          </tr>

          <!-- Booking Summary Card -->
          <tr>
            <td style="padding: 10px 32px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: collapse; overflow: hidden;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; width: 130px;">Request ID:</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace;">${payload.requestId}</td>
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

          <!-- Next Steps Box -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px 20px;">
                <div style="font-size: 13px; font-weight: 700; color: #854d0e; margin-bottom: 4px;">
                  What happens next?
                </div>
                <div style="font-size: 13px; color: #713f12; line-height: 1.5;">
                  Our licensed electrician <strong>Sanjit Mishra</strong> will contact you via <strong>${payload.preferredContact}</strong> at <strong>${payload.customerPhone}</strong> to confirm the appointment and provide safety guidance.
                </div>
              </div>
            </td>
          </tr>

          <!-- Direct Emergency Contact CTAs -->
          <tr>
            <td style="padding: 0 32px 28px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                Need Immediate Assistance?
              </p>
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

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6; text-align: center;">
              <div style="font-weight: 700; color: #334155;">VoltixNepal Electrical Services</div>
              <div>Kathmandu Valley, Bagmati Province, Nepal</div>
              <div style="margin-top: 6px;">
                <a href="https://voltixnepal.com" style="color: #dc2626; text-decoration: none; font-weight: 600;">voltixnepal.com</a>
              </div>
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
 * 3. CUSTOMER STATUS UPDATE & TECHNICIAN DISPATCH EMAIL
 * Triggered when Admin updates status or assigns a technician
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

  const statusDisplayMap: Record<string, { label: string; color: string; desc: string }> = {
    NEW: { label: 'Request Received', color: '#2563eb', desc: 'Your request has been received and is awaiting technician dispatch review.' },
    CONTACTED: { label: 'Technician Contacted', color: '#0284c7', desc: 'Our team has reached out to verify service details and timing.' },
    CONFIRMED: { label: 'Order Confirmed', color: '#16a34a', desc: 'Your service appointment is confirmed. Technician is scheduled.' },
    IN_PROGRESS: { label: 'Technician Dispatched / In Progress', color: '#d97706', desc: 'Technician is actively en-route or performing electrical work on-site.' },
    COMPLETED: { label: 'Work Completed & Verified', color: '#16a34a', desc: 'Electrical service work has been completed and safety tested.' },
    CANCELLED: { label: 'Cancelled', color: '#dc2626', desc: 'This service request was cancelled.' },
  };

  const currentStatus = statusDisplayMap[request.status] || {
    label: request.status,
    color: '#0f172a',
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
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 30px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #0f172a;">
                      Voltix<span style="color: #dc2626;">Nepal</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 2px;">
                      Order Status & Technician Tracking
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 5px 12px; font-size: 12px; font-weight: 700; color: ${currentStatus.color}; background-color: #f8fafc; border: 1px solid ${currentStatus.color}40; border-radius: 20px;">
                      ● ${currentStatus.label}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Status Info -->
          <tr>
            <td style="padding: 24px 30px 10px;">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                Order Update #${request.requestId}
              </div>
              <h1 style="margin: 6px 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                Hello ${request.customerName}, your service status has been updated:
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
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: ${currentStatus.color};">${currentStatus.label}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">Assigned Technician:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      ${request.adminAssigned || 'Sanjit Mishra (Lead Electrician)'}
                    </td>
                  </tr>
                  ${request.internalNotes ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b; vertical-align: top;">Technician Note:</td>
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
              <a href="${trackingUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
                Track Service Live Online ↗
              </a>
              <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                You can also track anytime by entering code <strong style="color: #0f172a;">${request.requestId}</strong> on voltixnepal.com/track
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center;">
              <div style="font-weight: 700; color: #475569;">VoltixNepal Electrical Services</div>
              <div>Kathmandu Valley, Nepal • Helpline: ${businessPhone}</div>
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
