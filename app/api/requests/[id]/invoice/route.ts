// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const invoiceNumber = `INV-${request.requestId}`;
    const pdfBuffer = await generateInvoicePdfBuffer({
      invoiceNumber,
      requestId: request.requestId,
      date: new Date(),
      paidAt: request.paidAt,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      customerEmail: request.customerEmail,
      customerAddress: `${request.address}${request.area ? `, ${request.area}` : ''}, ${request.city}`,
      serviceName: request.serviceName,
      description: request.description,
      billedAmount: Number(request.billedAmount) || 0,
      paidAmount: Number(request.paidAmount) || 0,
      paymentStatus: request.paymentStatus,
      paymentMethod: request.paymentMethod,
      paymentNotes: request.paymentNotes,
      paymentDueDate: request.paymentDueDate,
      adminAssigned: request.adminAssigned,
    });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="VoltixNepal-Invoice-${request.requestId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF invoice download:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate PDF invoice.' },
      { status: 500 }
    );
  }
}
