import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface InvoiceData {
  invoiceNumber: string;
  requestId: string;
  date: Date;
  paidAt?: Date | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string;
  serviceName: string;
  description: string;
  billedAmount: number;
  paidAmount: number;
  paymentStatus: string; // "PAID" | "PARTIAL" | "UNPAID"
  paymentMethod?: string | null;
  paymentNotes?: string | null;
  adminAssigned?: string | null;
}

export async function generateInvoicePdfBuffer(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `VoltixNepal Invoice ${data.invoiceNumber}`,
          Author: 'Voltix Nepal Electrical Services',
          Subject: `Electrical Service Invoice #${data.requestId}`,
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const logoPath = path.join(process.cwd(), 'public', 'logo-dark.png');
      const hasLogo = fs.existsSync(logoPath);

      // Top Header Section
      if (hasLogo) {
        try {
          doc.image(logoPath, 40, 35, { width: 140 });
        } catch {
          doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text('VOLTIX NEPAL', 40, 40);
        }
      } else {
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text('VOLTIX NEPAL', 40, 40);
      }

      // Invoice Title & Status
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#dc2626')
        .text('TAX INVOICE / RECEIPT', 300, 40, { align: 'right' });

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(data.paymentStatus === 'PAID' ? '#16a34a' : '#d97706')
        .text(
          data.paymentStatus === 'PAID'
            ? '✓ FULLY PAID & SETTLED'
            : data.paymentStatus === 'PARTIAL'
            ? 'PARTIAL PAYMENT RECEIVED'
            : 'PAYMENT DUE',
          300,
          65,
          { align: 'right' }
        );

      doc.moveDown(2);

      // Divider line
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(40, 95)
        .lineTo(555, 95)
        .stroke();

      // Company Info (Left) & Invoice Meta (Right)
      const metaTop = 110;
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('VoltixNepal Electrical Contracting & Engineering', 40, metaTop)
        .font('Helvetica')
        .fillColor('#475569')
        .text('Proprietor: Sanjit Mishra (Lead Electrician)', 40, metaTop + 14)
        .text('Kathmandu Valley, Bagmati Province, Nepal', 40, metaTop + 26)
        .text('Phone / WhatsApp: +977 9825870047', 40, metaTop + 38)
        .text('Email: sanjit@voltixnepal.com  •  voltixnepal.com', 40, metaTop + 50);

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#64748b')
        .text('INVOICE NO:', 360, metaTop)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(data.invoiceNumber, 450, metaTop, { align: 'right' })
        
        .font('Helvetica-Bold')
        .fillColor('#64748b')
        .text('REQUEST ID:', 360, metaTop + 14)
        .font('Helvetica')
        .fillColor('#dc2626')
        .text(`#${data.requestId}`, 450, metaTop + 14, { align: 'right' })

        .font('Helvetica-Bold')
        .fillColor('#64748b')
        .text('DATE:', 360, metaTop + 28)
        .font('Helvetica')
        .fillColor('#0f172a')
        .text(new Date(data.date).toLocaleDateString('en-GB'), 450, metaTop + 28, { align: 'right' })

        .font('Helvetica-Bold')
        .fillColor('#64748b')
        .text('PAYMENT MODE:', 360, metaTop + 42)
        .font('Helvetica')
        .fillColor('#0f172a')
        .text(data.paymentMethod || 'Cash in Hand', 450, metaTop + 42, { align: 'right' });

      // Customer Bill To Box
      const billToTop = 180;
      doc
        .roundedRect(40, billToTop, 515, 60, 6)
        .fillColor('#f8fafc')
        .fillAndStroke('#f8fafc', '#e2e8f0');

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#dc2626')
        .text('BILLED TO (CUSTOMER):', 55, billToTop + 10)
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(data.customerName, 55, billToTop + 24)
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`Phone: ${data.customerPhone}   |   Location: ${data.customerAddress}`, 55, billToTop + 40);

      if (data.customerEmail) {
        doc.text(`Email: ${data.customerEmail}`, 360, billToTop + 40);
      }

      // Items Table Header
      const tableTop = 260;
      doc
        .rect(40, tableTop, 515, 24)
        .fillColor('#0f172a')
        .fill();

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('DESCRIPTION / SERVICE RENDERED', 50, tableTop + 7)
        .text('TECHNICIAN', 320, tableTop + 7)
        .text('AMOUNT (NPR)', 460, tableTop + 7, { align: 'right' });

      // Item Row
      const rowTop = tableTop + 24;
      doc
        .rect(40, rowTop, 515, 65)
        .fillColor('#ffffff')
        .fillAndStroke('#ffffff', '#e2e8f0');

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(data.serviceName, 50, rowTop + 10)
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor('#475569')
        .text(data.description || 'Electrical diagnostic, installation, and safety verification.', 50, rowTop + 26, {
          width: 250,
          lineBreak: true,
        })
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#334155')
        .text(data.adminAssigned || 'Sanjit Mishra', 320, rowTop + 10)
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(`Rs. ${(data.billedAmount || data.paidAmount || 0).toLocaleString('en-IN')}`, 460, rowTop + 10, {
          align: 'right',
        });

      // Financial Calculation Summary
      const summaryTop = rowTop + 75;
      const formattedBilled = (data.billedAmount || data.paidAmount || 0).toLocaleString('en-IN');
      const formattedPaid = (data.paidAmount || 0).toLocaleString('en-IN');
      const balanceDue = Math.max(0, (data.billedAmount || 0) - (data.paidAmount || 0));

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Subtotal:', 380, summaryTop)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(`Rs. ${formattedBilled}`, 460, summaryTop, { align: 'right' })

        .font('Helvetica')
        .fillColor('#64748b')
        .text('Amount Paid / Received:', 380, summaryTop + 16)
        .font('Helvetica-Bold')
        .fillColor('#16a34a')
        .text(`Rs. ${formattedPaid}`, 460, summaryTop + 16, { align: 'right' });

      // Total Due Banner
      doc
        .rect(370, summaryTop + 34, 185, 26)
        .fillColor(balanceDue > 0 ? '#fef2f2' : '#f0fdf4')
        .fillAndStroke(balanceDue > 0 ? '#fef2f2' : '#f0fdf4', balanceDue > 0 ? '#fca5a5' : '#86efac');

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(balanceDue > 0 ? '#dc2626' : '#16a34a')
        .text('BALANCE DUE:', 380, summaryTop + 42)
        .text(`Rs. ${balanceDue.toLocaleString('en-IN')}`, 460, summaryTop + 42, { align: 'right' });

      // Notes / Payment Details (Left of summary)
      if (data.paymentNotes) {
        doc
          .roundedRect(40, summaryTop, 310, 60, 4)
          .fillColor('#f8fafc')
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .fillColor('#475569')
          .text('PAYMENT NOTES & REMARKS:', 50, summaryTop + 8)
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor('#64748b')
          .text(data.paymentNotes, 50, summaryTop + 22, { width: 290 });
      }

      // Terms & Guarantee Section
      const termsTop = summaryTop + 80;
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(0.5)
        .moveTo(40, termsTop)
        .lineTo(555, termsTop)
        .stroke();

      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('GUARANTEE & SERVICE TERMS:', 40, termsTop + 12)
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(
          '1. All wiring, replacement, and repair works are backed by Voltix Nepal workmanship warranty.\n' +
          '2. For any recurring electrical faults within the warranty period, priority emergency assistance will be dispatched.\n' +
          '3. Keep this digital invoice for your household or commercial maintenance records.',
          40,
          termsTop + 26,
          { width: 340, lineGap: 3 }
        );

      // Authorized Signatory
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('AUTHORIZED SIGNATORY', 420, termsTop + 12, { align: 'center' })
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#dc2626')
        .text('Sanjit Mishra', 420, termsTop + 40, { align: 'center' })
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Lead Electrician & Proprietor\nVoltix Nepal', 420, termsTop + 54, { align: 'center' });

      // Bottom Footer Bar
      doc
        .rect(40, 780, 515, 22)
        .fillColor('#0f172a')
        .fill();

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#ffffff')
        .text(
          'VoltixNepal Electrical Contracting • Kathmandu, Nepal • +977 9825870047 • info@voltixnepal.com • voltixnepal.com',
          40,
          787,
          { align: 'center', width: 515 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
