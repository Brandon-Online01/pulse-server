import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePdfGenerationDto } from './dto/create-pdf-generation.dto';
// Use CommonJS require for PDFKit
const PDFDocument = require('pdfkit');
import { generateQuotationPDF } from './templates/quotation';
import { StorageService, StorageFile } from '../lib/services/storage.service';
import { QuotationTemplateData } from './interfaces/pdf-templates.interface';

@Injectable()
export class PdfGenerationService {
	constructor(private readonly storageService: StorageService) {}

	/**
	 * Generate a PDF from a template and data, then upload to cloud storage
	 * @param createPdfGenerationDto DTO containing template name and data
	 * @returns Object containing the URL of the uploaded PDF
	 */
	async create(createPdfGenerationDto: CreatePdfGenerationDto) {
		const { template, data } = createPdfGenerationDto;

		try {
			// Generate the PDF
			const pdfBuffer = await this.generatePdfFromTemplate(template, data);

			// Generate a filename
			const fileName = `${template}_${Date.now()}.pdf`;

			// Upload to cloud storage
			const result = await this.uploadPdfToStorage(pdfBuffer, fileName);

			return {
				success: true,
				message: 'PDF generated and uploaded successfully',
				url: result.publicUrl,
				fileName: result.fileName,
			};
		} catch (error) {
			throw new BadRequestException(`Failed to generate PDF: ${error.message}`);
		}
	}

	/**
	 * Generate a PDF in memory using PDFKit based on template and data
	 * @param templateName Name of the template to use
	 * @param data Data to populate the template with
	 * @returns Buffer containing the generated PDF
	 */
	private async generatePdfFromTemplate(templateName: string, data: any): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			try {
				// Create PDF document with CommonJS style
				const doc = new PDFDocument({
					size: 'A4',
					margin: 50,
					info: {
						Creator: 'Loro PDF Service',
						Producer: 'PDFKit',
					},
				});

				// Accumulate PDF data in chunks
				const chunks: Buffer[] = [];
				doc.on('data', (chunk) => chunks.push(chunk));
				doc.on('end', () => resolve(Buffer.concat(chunks)));

				// Generate PDF based on template
				switch (templateName.toLowerCase()) {
					case 'quotation':
						generateQuotationPDF(doc, data as QuotationTemplateData);
						break;
					default:
						throw new Error(`Template '${templateName}' not found`);
				}

				// Finalize the PDF
				doc.end();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Upload a PDF buffer to cloud storage
	 * @param pdfBuffer Buffer containing the PDF data
	 * @param fileName Name to give the file
	 * @returns Upload result including public URL
	 */
	private async uploadPdfToStorage(pdfBuffer: Buffer, fileName: string) {
		const file: StorageFile = {
			buffer: pdfBuffer,
			mimetype: 'application/pdf',
			originalname: fileName,
			size: pdfBuffer.length,
			metadata: {
				type: 'pdf',
				generatedBy: 'pdf-generation-service',
			},
		};

		return await this.storageService.upload(file);
	}

	findAll() {
		return `This action returns all pdfGeneration`;
	}

	findOne(id: number) {
		return `This action returns a #${id} pdfGeneration`;
	}

	remove(id: number) {
		return `This action removes a #${id} pdfGeneration`;
	}
}
