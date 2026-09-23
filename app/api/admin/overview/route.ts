import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalRequests,
      newRequests,
      contactedRequests,
      confirmedRequests,
      inProgressRequests,
      completedRequests,
      cancelledRequests,
      todayRequests,
      totalCustomers,
      totalServices,
      recentRequests,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: 'NEW' } }),
      prisma.serviceRequest.count({ where: { status: 'CONTACTED' } }),
      prisma.serviceRequest.count({ where: { status: 'CONFIRMED' } }),
      prisma.serviceRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceRequest.count({ where: { status: 'CANCELLED' } }),
      prisma.serviceRequest.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.serviceRequest.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalRequests,
        newRequests,
        contactedRequests,
        confirmedRequests,
        inProgressRequests,
        completedRequests,
        cancelledRequests,
        todayRequests,
        totalCustomers,
        totalServices,
      },
      recentRequests,
      recentAuditLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
