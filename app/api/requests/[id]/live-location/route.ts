// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';
import { sendTechnicianRideStartedEmail } from '@/lib/email';

const db: any = prisma;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const request: any = await db.serviceRequest.findFirst({
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

    const liveData = {
      id: request.id,
      requestId: request.requestId,
      customerName: request.customerName,
      serviceName: request.serviceName,
      urgency: request.urgency,
      status: request.status,
      adminAssigned: request.adminAssigned,
      address: request.address,
      area: request.area,
      city: request.city,
      customerLocationName: request.customerLocationName,
      latitude: request.latitude,
      longitude: request.longitude,
      ipAddress: request.ipAddress,
      rideStarted: Boolean(request.rideStarted),
      rideStartedAt: request.rideStartedAt,
      technicianLat: request.technicianLat,
      technicianLng: request.technicianLng,
      technicianHeading: request.technicianHeading,
      technicianLastUpdate: request.technicianLastUpdate,
      internalNotes: request.internalNotes,
    };

    return NextResponse.json(
      {
        success: true,
        data: liveData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching live location:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { id } = params;
    const body = await req.json();

    const existing: any = await db.serviceRequest.findFirst({
      where: { OR: [{ id }, { requestId: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (body.technicianLat !== undefined && body.technicianLat !== null) {
      updateData.technicianLat = Number(body.technicianLat);
    }
    if (body.technicianLng !== undefined && body.technicianLng !== null) {
      updateData.technicianLng = Number(body.technicianLng);
    }
    if (body.technicianHeading !== undefined && body.technicianHeading !== null) {
      updateData.technicianHeading = Number(body.technicianHeading);
    }
    updateData.technicianLastUpdate = new Date();

    if (body.rideStarted !== undefined) {
      updateData.rideStarted = Boolean(body.rideStarted);
      if (body.rideStarted === true) {
        if (!existing.rideStartedAt) {
          updateData.rideStartedAt = new Date();
        }
        if (existing.status === 'NEW' || existing.status === 'CONFIRMED' || existing.status === 'CONTACTED') {
          updateData.status = 'IN_PROGRESS';
        }

        // Send automated email to customer notifying them that the electrician has started the ride!
        if (existing.customerEmail && (!existing.rideStarted || body.forceEmail)) {
          try {
            const settings = await db.websiteSettings.findUnique({
              where: { id: 'default_settings' },
            });

            await sendTechnicianRideStartedEmail(
              {
                requestId: existing.requestId,
                customerName: existing.customerName,
                customerEmail: existing.customerEmail,
                serviceName: existing.serviceName,
                address: existing.address,
                customerLocationName: existing.customerLocationName,
                adminAssigned: existing.adminAssigned || 'Sanjit Mishra',
              },
              {
                phone: settings?.phone,
                whatsappNumber: settings?.whatsappNumber,
              }
            );
          } catch (e) {
            console.error('Error sending ride started email:', e);
          }
        }
      } else {
        updateData.rideStartedAt = null;
      }
    }

    const updated: any = await db.serviceRequest.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Live GPS location updated.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating live location:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
