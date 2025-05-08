export interface PdfTemplateBaseData {
	[key: string]: any;
}

export interface CompanyDetails {
	name: string;
	addressLines?: string[]; // Changed to array for multi-line address
	phone?: string;
	email?: string;
	website?: string;
	vatNumber?: string;
	logoPath?: string; // Path to a local image file for the logo
}

export interface BankingDetails {
	bankName: string;
	accountHolder?: string; // Added account holder
	accountNumber: string;
	branchCode?: string;
	swiftCode?: string; // Added SWIFT for international
	paymentReferencePrefix?: string;
}

export interface QuotationTemplateData extends PdfTemplateBaseData {
	companyDetails: CompanyDetails;
	quotationId: string;
	date: Date | string;
	validUntil: Date | string;
	client: {
		name: string;
		email?: string;
		phone?: string;
		address?: string; // Billing address
		deliveryAddress?: string; // Optional delivery address
	};
	items: Array<{
		itemCode?: string; // Optional
		description: string;
		quantity: number;
		unitPrice: number;
		// discountPercentage?: number; // Future: if per-item discount is needed
		// taxPercentage?: number;      // Future: if per-item tax is needed
		// totalExcl?: number;          // Future: if per-item total excl tax is needed
	}>;
	subtotal: number;
	tax: number; // Assuming this is total tax amount
	total: number;
	currency: string;
	terms?: string;
	bankingDetails?: BankingDetails;
}
