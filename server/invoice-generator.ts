import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export interface InvoiceData {
  invoiceNumber: string;
  authorName: string;
  email: string;
  affiliation: string;
  manuscriptTitle: string;
  manuscriptId: string;
  publicationType: string;
  numberOfAuthors: number;
  amount: string;
  currency: string;
  modeOfPayment: string;
  transactionNumber: string;
  transactionDate: string;
  submittedAt: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<{ buffer: Buffer; filename: string; url: string }> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 30, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const filename = `${data.invoiceNumber}.pdf`;
      const invoicePath = path.join(process.cwd(), 'attached_assets', 'invoices', filename);
      
      fs.writeFileSync(invoicePath, buffer);
      const url = `/downloads/invoices/${filename}`;
      console.log(`💾 Invoice saved locally: ${invoicePath}`);
      
      resolve({ buffer, filename, url });
    });
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const margins = 30;
    const contentWidth = pageWidth - 2 * margins;

    // ==================== PROFESSIONAL HEADER ====================
    const logoPath = path.join(process.cwd(), 'attached_assets', 'logo_1760792847426.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, pageWidth / 2 - 22, margins, { width: 44, height: 44 });
    }

    doc.y = margins + 48;
    
    // Company Name - Bold Blue
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e3a8a').text('SCHOLAR INDIA PUBLISHERS', { align: 'center' });
    
    // Tagline
    doc.fontSize(8).font('Helvetica').fillColor('#555555').text('International Peer-Reviewed Academic Publisher', { align: 'center' });
    
    // Address
    doc.fontSize(7).fillColor('#666666').text('2/477, Perumal Kovil Street, Mettuchery, Mappedu, Tiruvallur, Chennai - 631402, TN, India', { align: 'center' });
    doc.fontSize(7).text('Email: prof.klirsn@gmail.com', { align: 'center' });
    
    doc.fillColor('#1e3a8a').lineWidth(1.5).moveTo(margins, doc.y + 8).lineTo(pageWidth - margins, doc.y + 8).stroke();
    doc.moveDown(1.2);

    // ==================== INVOICE TITLE & INFO ====================
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e3a8a').text('PUBLICATION INVOICE', { align: 'center' });
    doc.moveDown(0.6);

    // Header Info - Two columns
    const col1X = margins;
    const col2X = pageWidth / 2 + 5;
    const headerY = doc.y;

    // Left Column
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a8a');
    doc.text('INVOICE NUMBER', col1X, headerY);
    doc.fontSize(8).font('Helvetica').fillColor('black').text(data.invoiceNumber, col1X, headerY + 10);

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a8a').text('BILL TO', col1X, headerY + 22);
    doc.fontSize(8).font('Helvetica').fillColor('black').text(data.authorName.toUpperCase(), col1X, headerY + 32);
    doc.fontSize(7).text(data.affiliation, col1X, headerY + 40);
    doc.fontSize(7).text(data.email, col1X, headerY + 46);

    // Right Column
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a8a').text('DATE', col2X);
    doc.fontSize(8).font('Helvetica').fillColor('black').text(data.submittedAt, col2X, headerY + 10);

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a8a').text('TRANSACTION ID', col2X, headerY + 22);
    doc.fontSize(8).font('Helvetica').fillColor('black').text(data.transactionNumber, col2X, headerY + 32);

    doc.y = headerY + 56;
    doc.moveDown(0.3);

    // ==================== MANUSCRIPT INFO BOX ====================
    doc.rect(margins, doc.y, contentWidth, 28).fillAndStroke('#f0f5ff', '#1e3a8a');
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#1e3a8a').text('MANUSCRIPT INFORMATION', margins + 8, doc.y + 4);
    doc.fontSize(7).font('Helvetica').fillColor('#333333');
    doc.text(`Publication Type: ${data.publicationType.toUpperCase()} | Authors: ${data.numberOfAuthors} | Title: ${data.manuscriptTitle}`, margins + 8, doc.y + 14, { width: contentWidth - 16 });
    doc.moveDown(2.2);

    // ==================== AMOUNT TABLE ====================
    const tableY = doc.y;
    const tableH = 15;

    // Header
    doc.rect(margins, tableY, contentWidth, tableH).fillAndStroke('#1e3a8a', '#1e3a8a');
    doc.fontSize(7).font('Helvetica-Bold').fillColor('white');
    doc.text('DESCRIPTION', margins + 8, tableY + 3);
    doc.text('QTY', margins + 200, tableY + 3);
    doc.text('UNIT PRICE', margins + 230, tableY + 3);
    doc.text('AMOUNT', margins + 305, tableY + 3);

    // Row
    const rowY = tableY + tableH;
    doc.rect(margins, rowY, contentWidth, tableH).fillAndStroke('#fafbfc', '#ccc');
    doc.fontSize(7).font('Helvetica').fillColor('black');
    doc.text('ARTICLE PROCESSING CHARGE', margins + 8, rowY + 3);
    doc.text('1', margins + 200, rowY + 3);
    doc.text(`₹ ${data.amount}`, margins + 230, rowY + 3);
    doc.text(`₹ ${data.amount}`, margins + 305, rowY + 3);

    // Total
    const totalY = rowY + tableH;
    doc.rect(margins, totalY, contentWidth, tableH).fillAndStroke('#1e3a8a', '#1e3a8a');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('white');
    doc.text('TOTAL', margins + 8, totalY + 2);
    doc.text(`₹ ${data.amount}`, margins + 305, totalY + 2);

    doc.y = totalY + tableH + 10;

    // ==================== PAYMENT DETAILS ====================
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#1e3a8a').text('PAYMENT DETAILS');
    doc.moveDown(0.3);
    
    doc.fontSize(6).font('Helvetica').fillColor('#333333');
    doc.text(`Mode of Payment: ${data.modeOfPayment.toUpperCase()} | Payment Date: ${data.transactionDate}`, margins);
    doc.text(`Bank: HDFC Bank / ICICI Bank | Account Holder: Scholar India Publishers`, margins);
    doc.text(`Terms: Payment Due Within 7 Days From Invoice Date`, margins);

    doc.moveDown(0.5);

    // ==================== NOTES ====================
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#1e3a8a').text('IMPORTANT NOTES');
    doc.moveDown(0.2);
    
    doc.fontSize(5.5).font('Helvetica').fillColor('#444444');
    const notesText = `• This invoice is for the Article Processing Charge (APC) for publication in Scholar India Publishers journals.
• Upon receipt of payment, your manuscript will be forwarded to our editorial team for peer review.
• All submissions are subject to our standard editorial policies and double-blind peer review process.
• Please retain this invoice for your records and reference.`;
    
    doc.text(notesText, margins, doc.y, { width: contentWidth });

    // ==================== FOOTER ====================
    doc.moveDown(0.5);
    doc.strokeColor('#ddd').lineWidth(0.5).moveTo(margins, doc.y).lineTo(pageWidth - margins, doc.y).stroke();
    doc.moveDown(0.4);

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a8a').text('SCHOLAR INDIA PUBLISHERS', { align: 'center' });
    doc.fontSize(6).font('Helvetica').fillColor('#555555');
    doc.text('UDYAM-TN-24-0029566 | MSME Registered 2022', { align: 'center' });
    doc.fontSize(5.5).fillColor('#666666');
    doc.text('2/477, Perumal Kovil Street, Mettuchery, Mappedu, Tiruvallur, Chennai - 631402, Tamil Nadu, India', { align: 'center' });
    doc.text('Email: prof.klirsn@gmail.com | Phone: Available Upon Request', { align: 'center' });
    doc.fontSize(5).fillColor('#888888');
    doc.text('This is an electronically generated invoice. No signature required.', { align: 'center' });
    doc.fontSize(5).text(`© 2024 Scholar India Publishers. All Rights Reserved. Invoice #${data.invoiceNumber}`, { align: 'center' });

    doc.end();
  });
}
