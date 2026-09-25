import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';
import { sendStatusUpdateEmail, sendPaymentInvoiceEmail } from '@/lib/email';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const request = await prisma.serviceRequest.findFirst({
      where: {
        OR: [{ id }, { requestId: id }],
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    // Find all previous requests for this customer to calculate loyalty count and history
    const customerRequests = await prisma.serviceRequest.findMany({
      where: {
        OR: [
          { customerPhone: request.customerPhone },
          ...(request.customerEmail ? [{ customerEmail: request.customerEmail }] : []),
          ...(request.userId ? [{ userId: request.userId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerRequestCount = customerRequests.length || 1;

    return NextResponse.json({
      success: true,
      request: {
        ...request,
        customerRequestCount,
      },
      customerHistory: customerRequests,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.serviceRequest.findFirst({
      where: { OR: [{ id }, { requestId: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    const billedAmount =
      body.billedAmount !== undefined
        ? Number(body.billedAmount)
        : existing.billedAmount;

    let paidAmount =
      body.paidAmount !== undefined
        ? Number(body.paidAmount)
        : existing.paidAmount;

    let paymentStatus =
      body.paymentStatus !== undefined
        ? body.paymentStatus
        : existing.paymentStatus;

    // Auto-sync paid amount if paymentStatus is marked PAID without paidAmount
    if (paymentStatus === 'PAID' && (paidAmount === 0 || paidAmount === null) && billedAmount && billedAmount > 0) {
      paidAmount = billedAmount;
    }

    let paidAt = existing.paidAt;
    if (paymentStatus === 'PAID' && !paidAt) {
      paidAt = new Date();
    } else if (paymentStatus === 'UNPAID') {
      paidAt = null;
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: existing.id },
      data: {
        status: body.status !== undefined ? body.status : existing.status,
        internalNotes:
          body.internalNotes !== undefined
            ? body.internalNotes
            : existing.internalNotes,
        adminAssigned:
          body.adminAssigned !== undefined
            ? body.adminAssigned
            : existing.adminAssigned,
        billedAmount,
        paidAmount,
        paymentStatus,
        paymentMethod:
          body.paymentMethod !== undefined
            ? body.paymentMethod
            : existing.paymentMethod,
        paymentNotes:
          body.paymentNotes !== undefined
            ? body.paymentNotes
            : existing.paymentNotes,
        paidAt,
      },
    });

    // Audit log
    const changes: string[] = [];
    if (body.status !== undefined && body.status !== existing.status) {
      changes.push(`Status: ${existing.status} -> ${updated.status}`);
    }
    if (body.billedAmount !== undefined || body.paidAmount !== undefined || body.paymentStatus !== undefined) {
      changes.push(`Billing: Rs. ${billedAmount} (Paid: Rs. ${paidAmount}, ${paymentStatus})`);
    }

    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: `UPDATE_REQUEST: #${updated.requestId}`,
        entityType: 'ServiceRequest',
        entityId: updated.id,
        details: changes.join(' | ') || `Updated request #${updated.requestId}`,
      },
    });

    // Send Payment Receipt & PDF Invoice Email to Customer if payment received or updated
    const isPaymentUpdate =
      (body.paidAmount !== undefined && Number(body.paidAmount) > 0) ||
      body.paymentStatus === 'PAID' ||
      (body.paymentStatus === 'PARTIAL' && Number(updated.paidAmount) > 0);

    if (updated.customerEmail && isPaymentUpdate) {
      prisma.websiteSettings.findUnique({ where: { id: 'default_settings' } }).then((settings) => {
        sendPaymentInvoiceEmail(
          {
            requestId: updated.requestId,
            customerName: updated.customerName,
            customerEmail: updated.customerEmail,
            customerPhone: updated.customerPhone,
            customerAddress: `${updated.address}${updated.area ? `, ${updated.area}` : ''}, ${updated.city}`,
            serviceName: updated.serviceName,
            description: updated.description,
            billedAmount: Number(updated.billedAmount) || 0,
            paidAmount: Number(updated.paidAmount) || 0,
            paymentStatus: updated.paymentStatus,
            paymentMethod: updated.paymentMethod,
            paymentNotes: updated.paymentNotes,
            adminAssigned: updated.adminAssigned,
            paidAt: updated.paidAt,
          },
          {
            phone: settings?.phone,
            whatsappNumber: settings?.whatsappNumber,
          }
        ).catch((err) => console.error('Failed sending payment invoice email:', err));
      });
    }

    // Send Status Update Email to Customer in background if status or assigned technician changed (and not just payment)
    if (updated.customerEmail && (body.status !== undefined || body.adminAssigned !== undefined) && !isPaymentUpdate) {
      prisma.websiteSettings.findUnique({ where: { id: 'default_settings' } }).then((settings) => {
        sendStatusUpdateEmail(
          {
            requestId: updated.requestId,
            customerName: updated.customerName,
            customerEmail: updated.customerEmail,
            serviceName: updated.serviceName,
            status: updated.status,
            internalNotes: updated.internalNotes,
            adminAssigned: updated.adminAssigned,
            address: updated.address,
          },
          {
            phone: settings?.phone,
            whatsappNumber: settings?.whatsappNumber,
          }
        ).catch((err) => console.error('Failed sending status email:', err));
      });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id } = params;
    const existing = await prisma.serviceRequest.findFirst({
      where: { OR: [{ id }, { requestId: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    await prisma.serviceRequest.delete({
      where: { id: existing.id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: 'DELETE_REQUEST',
        entityType: 'ServiceRequest',
        entityId: existing.id,
        details: `Deleted request #${existing.requestId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
