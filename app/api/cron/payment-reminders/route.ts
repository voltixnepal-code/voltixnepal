// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPaymentInvoiceEmail } from '@/lib/email';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  return handlePaymentReminders(req);
}

export async function POST(req: NextRequest) {
  return handlePaymentReminders(req);
}

async function handlePaymentReminders(req: NextRequest) {
  try {
    // Optional admin verification or secret header verification
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isCronAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuthorized) {
      const auth = await verifyAdminRequest(req);
      if (!auth.isAdmin) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized access to payment reminder cron' },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    // 2 days ago (48 hours)
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Fetch all requests that have unpaid/partial balance and an email
    const pendingRequests = await prisma.serviceRequest.findMany({
      where: {
        paymentStatus: { not: 'PAID' },
        status: { not: 'CANCELLED' },
        customerEmail: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    const settings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });

    const results: any[] = [];
    let sentCount = 0;
    let skippedCount = 0;

    for (const reqItem of pendingRequests) {
      const billed = Number(reqItem.billedAmount || 0);
      const paid = Number(reqItem.paidAmount || 0);
      const balanceDue = billed - paid;

      // Must have an actual positive balance due
      if (billed <= 0 || balanceDue <= 0) {
        skippedCount++;
        continue;
      }

      // Check 2-day reminder interval
      const lastSent = reqItem.lastReminderSentAt ? new Date(reqItem.lastReminderSentAt) : null;
      const createdDate = new Date(reqItem.createdAt);

      let isEligible = false;
      if (!lastSent) {
        // If never reminded, check if at least 2 days have passed since request created
        isEligible = createdDate <= twoDaysAgo;
      } else {
        // If already reminded, check if at least 48 hours have passed since last reminder
        isEligible = lastSent <= twoDaysAgo;
      }

      if (!isEligible) {
        skippedCount++;
        continue;
      }

      const reminderNum = (reqItem.reminderCount || 0) + 1;

      try {
        const emailRes = await sendPaymentInvoiceEmail(
          {
            requestId: reqItem.requestId,
            customerName: reqItem.customerName,
            customerEmail: reqItem.customerEmail,
            customerPhone: reqItem.customerPhone,
            customerAddress: `${reqItem.address}${reqItem.area ? `, ${reqItem.area}` : ''}, ${reqItem.city}`,
            serviceName: reqItem.serviceName,
            description: reqItem.description,
            billedAmount: billed,
            paidAmount: paid,
            paymentStatus: reqItem.paymentStatus,
            paymentMethod: reqItem.paymentMethod,
            paymentNotes: reqItem.paymentNotes,
            adminAssigned: reqItem.adminAssigned,
            paidAt: reqItem.paidAt,
            paymentDueDate: reqItem.paymentDueDate,
            isReminder: true,
            reminderCount: reminderNum,
          },
          {
            phone: settings?.phone,
            whatsappNumber: settings?.whatsappNumber,
          }
        );

        if (emailRes.success) {
          await prisma.serviceRequest.update({
            where: { id: reqItem.id },
            data: {
              lastReminderSentAt: now,
              reminderCount: reminderNum,
            },
          });

          await prisma.auditLog.create({
            data: {
              adminEmail: 'system:cron-payment-reminders',
              action: `AUTO_PAYMENT_REMINDER_SENT: #${reqItem.requestId}`,
              entityType: 'ServiceRequest',
              entityId: reqItem.id,
              details: `Automated 2-day reminder #${reminderNum} sent to ${reqItem.customerEmail}. Pending balance: Rs. ${balanceDue}`,
            },
          });

          sentCount++;
          results.push({
            requestId: reqItem.requestId,
            customerEmail: reqItem.customerEmail,
            balanceDue,
            reminderNumber: reminderNum,
            status: 'SENT',
          });
        } else {
          results.push({
            requestId: reqItem.requestId,
            customerEmail: reqItem.customerEmail,
            status: 'FAILED',
            error: emailRes.error,
          });
        }
      } catch (err: any) {
        console.error(`Error sending auto reminder for #${reqItem.requestId}:`, err);
        results.push({
          requestId: reqItem.requestId,
          status: 'ERROR',
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Automated 2-day reminder scan completed. Sent: ${sentCount}, Skipped: ${skippedCount}`,
      sentCount,
      skippedCount,
      totalPendingScanned: pendingRequests.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in payment reminders cron:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Cron error' },
      { status: 500 }
    );
  }
}
