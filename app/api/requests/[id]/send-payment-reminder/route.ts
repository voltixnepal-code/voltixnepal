// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';
import { sendPaymentInvoiceEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        OR: [{ id: params.id }, { requestId: params.id }],
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, message: 'Service request not found.' },
        { status: 404 }
      );
    }

    if (!request.customerEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer does not have an email address on file. Please use WhatsApp reminder instead.',
        },
        { status: 400 }
      );
    }

    const billed = Number(request.billedAmount) || 0;
    const paid = Number(request.paidAmount) || 0;
    const balanceDue = Math.max(0, billed - paid);

    const settings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });

    const reminderNumber = (request.reminderCount || 0) + 1;

    // Send email with PDF invoice attached
    const emailResult = await sendPaymentInvoiceEmail(
      {
        requestId: request.requestId,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        customerAddress: `${request.address}${request.area ? `, ${request.area}` : ''}, ${request.city}`,
        serviceName: request.serviceName,
        description: request.description,
        billedAmount: billed,
        paidAmount: paid,
        paymentStatus: request.paymentStatus,
        paymentMethod: request.paymentMethod,
        paymentNotes: request.paymentNotes,
        adminAssigned: request.adminAssigned,
        paidAt: request.paidAt,
        paymentDueDate: request.paymentDueDate,
        isReminder: true,
        reminderCount: reminderNumber,
      },
      {
        phone: settings?.phone,
        whatsappNumber: settings?.whatsappNumber,
      }
    );

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || 'Failed to dispatch email.',
        },
        { status: 500 }
      );
    }

    // Update lastReminderSentAt & reminderCount
    const updated = await prisma.serviceRequest.update({
      where: { id: request.id },
      data: {
        lastReminderSentAt: new Date(),
        reminderCount: reminderNumber,
      },
    });

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: `PAYMENT_REMINDER_SENT: #${request.requestId}`,
        entityType: 'ServiceRequest',
        entityId: request.id,
        details: `Sent payment reminder #${reminderNumber} with PDF invoice to ${request.customerEmail}. Pending balance: Rs. ${balanceDue}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Payment invoice reminder #${reminderNumber} sent successfully with PDF to ${request.customerEmail}.`,
      lastReminderSentAt: updated.lastReminderSentAt,
      reminderCount: updated.reminderCount,
    });
  } catch (error: any) {
    console.error('Error sending payment reminder:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
