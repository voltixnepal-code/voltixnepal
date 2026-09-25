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

    const now = new Date();
    
    // Start of Today (00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of This Week (Monday 00:00:00)
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - distanceToMonday);

    // Start of This Month (1st 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      allRequests,
      newRequests,
      contactedRequests,
      confirmedRequests,
      inProgressRequests,
      completedRequests,
      cancelledRequests,
      todayRequests,
      totalCustomers,
      totalServices,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.serviceRequest.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceRequest.count({ where: { status: 'NEW' } }),
      prisma.serviceRequest.count({ where: { status: 'CONTACTED' } }),
      prisma.serviceRequest.count({ where: { status: 'CONFIRMED' } }),
      prisma.serviceRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceRequest.count({ where: { status: 'CANCELLED' } }),
      prisma.serviceRequest.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Build map of customer phone -> total bookings count for repeat work tracking (x1, x2, x3...)
    const phoneCountMap: Record<string, number> = {};
    const emailCountMap: Record<string, number> = {};

    allRequests.forEach((r) => {
      const cleanPhone = (r.customerPhone || '').replace(/\D/g, '');
      if (cleanPhone) {
        phoneCountMap[cleanPhone] = (phoneCountMap[cleanPhone] || 0) + 1;
      }
      const cleanEmail = (r.customerEmail || '').trim().toLowerCase();
      if (cleanEmail) {
        emailCountMap[cleanEmail] = (emailCountMap[cleanEmail] || 0) + 1;
      }
    });

    // Compute Financial Earnings (Daily, Weekly, Monthly, Total Lifetime)
    let dailyEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;
    let totalEarnings = 0;
    let totalBilled = 0;
    let todayPaidCount = 0;
    let monthPaidCount = 0;

    allRequests.forEach((r) => {
      const billed = Number(r.billedAmount || 0);
      const paid = Number(r.paidAmount || 0);
      totalBilled += billed;
      totalEarnings += paid;

      const dateToCheck = r.paidAt || r.updatedAt || r.createdAt;
      const itemDate = new Date(dateToCheck);

      if (paid > 0) {
        if (itemDate >= startOfToday) {
          dailyEarnings += paid;
          todayPaidCount += 1;
        }
        if (itemDate >= startOfWeek) {
          weeklyEarnings += paid;
        }
        if (itemDate >= startOfMonth) {
          monthlyEarnings += paid;
          monthPaidCount += 1;
        }
      }
    });

    const pendingReceivable = Math.max(0, totalBilled - totalEarnings);

    // Decorate recent requests with customer repeat booking count
    const recentRequests = allRequests.slice(0, 8).map((r) => {
      const cleanPhone = (r.customerPhone || '').replace(/\D/g, '');
      const cleanEmail = (r.customerEmail || '').trim().toLowerCase();
      const count =
        phoneCountMap[cleanPhone] || emailCountMap[cleanEmail] || 1;

      return {
        ...r,
        customerRequestCount: count,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalRequests: allRequests.length,
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
      earnings: {
        dailyEarnings,
        weeklyEarnings,
        monthlyEarnings,
        totalEarnings,
        totalBilled,
        pendingReceivable,
        todayPaidCount,
        monthPaidCount,
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
