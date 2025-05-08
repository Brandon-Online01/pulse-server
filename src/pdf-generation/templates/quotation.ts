// Use CommonJS require for PDFKit
const PDFDocument = require('pdfkit');
import { QuotationTemplateData } from '../interfaces/pdf-templates.interface';

/**
 * Generate a quotation PDF using PDFKit
 * @param doc PDFKit document instance
 * @param data Quotation data to populate the template
 */
export const generateQuotationPDF = (doc: any, data: QuotationTemplateData): void => {
	// Set some basic document properties
	doc.info.Title = `Quotation #${data.quotationId}`;
	doc.info.Author = 'Loro';

	// Add company information at the top
	doc.fontSize(24).font('Helvetica-Bold').text('QUOTATION', { align: 'center' });
	doc.moveDown();

	// Add quotation details
	doc.fontSize(12).font('Helvetica-Bold').text('Quotation #:', 50, 150);
	doc.fontSize(12).font('Helvetica').text(data.quotationId, 150, 150);

	doc.fontSize(12).font('Helvetica-Bold').text('Date:', 50, 175);
	doc.fontSize(12).font('Helvetica').text(formatDate(data.date), 150, 175);

	doc.fontSize(12).font('Helvetica-Bold').text('Valid Until:', 50, 200);
	doc.fontSize(12).font('Helvetica').text(formatDate(data.validUntil), 150, 200);

	// Add client information
	doc.fontSize(16).font('Helvetica-Bold').text('Client Information', 50, 250);
	doc.fontSize(12).font('Helvetica').text(data.client.name, 50, 275);
	doc.fontSize(12)
		.font('Helvetica')
		.text(data.client.email || '', 50, 295);
	doc.fontSize(12)
		.font('Helvetica')
		.text(data.client.phone || '', 50, 315);
	doc.fontSize(12)
		.font('Helvetica')
		.text(data.client.address || '', 50, 335);

	// Add items table
	addItemsTable(doc, data);

	// Add totals
	const yPos = doc.y + 20;
	doc.fontSize(12).font('Helvetica-Bold').text('Subtotal:', 400, yPos);
	doc.fontSize(12)
		.font('Helvetica')
		.text(formatCurrency(data.subtotal, data.currency), 480, yPos, { align: 'right' });

	doc.fontSize(12)
		.font('Helvetica-Bold')
		.text('Tax:', 400, yPos + 25);
	doc.fontSize(12)
		.font('Helvetica')
		.text(formatCurrency(data.tax, data.currency), 480, yPos + 25, { align: 'right' });

	doc.fontSize(12)
		.font('Helvetica-Bold')
		.text('Total:', 400, yPos + 50);
	doc.fontSize(12)
		.font('Helvetica-Bold')
		.text(formatCurrency(data.total, data.currency), 480, yPos + 50, { align: 'right' });

	// Add terms and conditions
	doc.moveDown(4);
	doc.fontSize(14).font('Helvetica-Bold').text('Terms and Conditions', { underline: true });
	doc.fontSize(10)
		.font('Helvetica')
		.text(data.terms || 'Standard terms and conditions apply.');

	// Add footer with page number
	const pageCount = doc.bufferedPageRange().count;
	for (let i = 0; i < pageCount; i++) {
		doc.switchToPage(i);
		doc.fontSize(10)
			.font('Helvetica')
			.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
	}
};

/**
 * Add items table to the PDF
 */
function addItemsTable(doc: any, data: QuotationTemplateData): void {
	// Set the y position for the table
	const startY = 380;
	let currentY = startY;

	// Table headers
	doc.fontSize(12).font('Helvetica-Bold');
	doc.text('Item', 50, currentY);
	doc.text('Description', 150, currentY);
	doc.text('Qty', 350, currentY);
	doc.text('Unit Price', 400, currentY);
	doc.text('Total', 480, currentY);

	currentY += 20;

	// Draw header underline
	doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
	currentY += 10;

	// Table rows
	doc.fontSize(10).font('Helvetica');

	data.items.forEach((item, index) => {
		// Check if we need a new page
		if (currentY > doc.page.height - 150) {
			doc.addPage();
			currentY = 50;

			// Add header for the new page
			doc.fontSize(12).font('Helvetica-Bold');
			doc.text('Item', 50, currentY);
			doc.text('Description', 150, currentY);
			doc.text('Qty', 350, currentY);
			doc.text('Unit Price', 400, currentY);
			doc.text('Total', 480, currentY);

			currentY += 20;
			doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
			currentY += 10;
			doc.fontSize(10).font('Helvetica');
		}

		doc.text((index + 1).toString(), 50, currentY);
		doc.text(item.description, 150, currentY);
		doc.text(item.quantity.toString(), 350, currentY);
		doc.text(formatCurrency(item.unitPrice, data.currency), 400, currentY);
		doc.text(formatCurrency(item.quantity * item.unitPrice, data.currency), 480, currentY, { align: 'right' });

		currentY += 20;
	});

	// Draw bottom line
	doc.moveTo(50, currentY).lineTo(550, currentY).stroke();

	// Update the doc's Y position
	doc.y = currentY + 10;
}

/**
 * Format a date to a standard format
 */
function formatDate(date: Date | string): string {
	const d = new Date(date);
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

/**
 * Format a currency value
 */
function formatCurrency(amount: number, currency: string): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency || 'USD',
	}).format(amount);
}
