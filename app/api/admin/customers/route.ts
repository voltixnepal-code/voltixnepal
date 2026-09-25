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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const whereClause: any = {};
    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const [users, allRequests] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          requests: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceRequest.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Map all requests by phone & email
    const phoneMap: Record<string, typeof allRequests> = {};
    allRequests.forEach((r) => {
      const p = (r.customerPhone || '').replace(/\D/g, '');
      if (p) {
        if (!phoneMap[p]) phoneMap[p] = [];
        phoneMap[p].push(r);
      }
    });

    const userEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const userPhones = new Set(
      users.map((u) => (u.phone || '').replace(/\D/g, '')).filter(Boolean)
    );

    // Build customer list starting with registered users
    const customerList = users.map((u) => {
      const cleanPhone = (u.phone || '').replace(/\D/g, '');
      const userReqs = phoneMap[cleanPhone] || u.requests || [];
      const totalSpent = userReqs.reduce((sum, r: any) => sum + (Number(r.paidAmount) || 0), 0);
      const totalBilled = userReqs.reduce((sum, r: any) => sum + (Number(r.billedAmount) || 0), 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isRegistered: true,
        bookingCount: Math.max(userReqs.length, 1),
        totalSpent,
        totalBilled,
        createdAt: u.createdAt,
      };
    });

    // Add unique unregistered customers from service requests
    const seenPhones = new Set(userPhones);
    allRequests.forEach((r) => {
      const cleanPhone = (r.customerPhone || '').replace(/\D/g, '');
      if (cleanPhone && !seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone);
        const reqs = phoneMap[cleanPhone] || [r];
        const totalSpent = reqs.reduce((sum, req: any) => sum + (Number(req.paidAmount) || 0), 0);
        const totalBilled = reqs.reduce((sum, req: any) => sum + (Number(req.billedAmount) || 0), 0);

        // Check if matches search query
        if (
          !query ||
          r.customerName.toLowerCase().includes(query.toLowerCase()) ||
          (r.customerEmail && r.customerEmail.toLowerCase().includes(query.toLowerCase())) ||
          r.customerPhone.includes(query)
        ) {
          customerList.push({
            id: `guest_${r.id}`,
            name: r.customerName,
            email: r.customerEmail || 'Guest (Direct Booking)',
            phone: r.customerPhone,
            isRegistered: false,
            bookingCount: reqs.length,
            totalSpent,
            totalBilled,
            createdAt: r.createdAt,
          });
        }
      }
    });

    // Sort by bookingCount desc, then totalSpent desc
    customerList.sort((a, b) => b.bookingCount - a.bookingCount || b.totalSpent - a.totalSpent);

    return NextResponse.json({ success: true, customers: customerList });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
