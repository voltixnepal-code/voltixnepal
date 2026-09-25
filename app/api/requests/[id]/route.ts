import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';
import { sendStatusUpdateEmail } from '@/lib/email';

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

    return NextResponse.json({ success: true, request });
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
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: auth.email || 'admin@voltixnepal.com',
        action: `UPDATE_REQUEST_STATUS: ${existing.status} -> ${updated.status}`,
        entityType: 'ServiceRequest',
        entityId: updated.id,
        details: `Updated request #${updated.requestId}`,
      },
    });

    // Send Status Update Email to Customer in background if status or assigned technician changed
    if (updated.customerEmail && (body.status !== undefined || body.adminAssigned !== undefined)) {
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
