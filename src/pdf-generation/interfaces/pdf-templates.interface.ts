export interface PdfTemplateBaseData {
	[key: string]: any;
}

export interface QuotationTemplateData extends PdfTemplateBaseData {
	quotationId: string;
	date: Date | string;
	validUntil: Date | string;
	client: {
		name: string;
		email?: string;
		phone?: string;
		address?: string;
	};
	items: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
	}>;
	subtotal: number;
	tax: number;
	total: number;
	currency: string;
	terms?: string;
}
