import { EmailType } from "../enums/email.enums";

export interface BaseEmailData {
    name: string;
}

export interface SignupEmailData extends BaseEmailData {
    verificationLink: string;
    welcomeOffers?: string[];
}

export interface VerificationEmailData extends BaseEmailData {
    verificationCode: string;
}

export interface PasswordResetData extends BaseEmailData {
    resetLink: string;
}

export interface PasswordChangedData extends BaseEmailData {
    changeTime: string;
}

export interface InvoiceData extends BaseEmailData {
    invoiceId: string;
    date: Date;
    amount: number;
    currency: string;
    paymentMethod: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
}

export interface DailyReportData extends BaseEmailData {
    date: string;
    metrics: {
        xp?: {
            level: number;
            currentXP: number;
            todayXP: number;
        };
        attendance?: {
            status: string;
            startTime: string;
            endTime?: string;
            totalHours: number;
            duration?: string;
            checkInLocation?: {
                latitude: number;
                longitude: number;
                notes: string;
            };
            checkOutLocation?: {
                latitude: number;
                longitude: number;
                notes: string;
            };
            verifiedAt?: string;
            verifiedBy?: string;
        };
        totalQuotations: number;
        totalRevenue: string;
        newCustomers: number;
        quotationGrowth: string;
        revenueGrowth: string;
        customerGrowth: string;
        userSpecific?: {
            todayLeads: number;
            todayClaims: number;
            todayTasks: number;
            todayQuotations: number;
            hoursWorked: number;
        };
    };
    tracking?: {
        totalDistance: string;
        locations: Array<{
            address: string;
            timeSpent: string;
        }>;
        averageTimePerLocation: string;
    };
}

export interface QuotationData extends BaseEmailData {
    quotationId: string;
    validUntil: Date;
    total: number;
    currency: string;
    quotationItems: Array<{
        quantity: number;
        product: { 
            uid: number;
            name: string;
            code: string;
        };
        totalPrice: number;
    }>;
}

export interface QuotationInternalData extends QuotationData {
    customerType: string;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
}

export interface QuotationResellerData extends QuotationData {
    resellerCommission: number;
    resellerCode: string;
}

export interface QuotationWarehouseData extends QuotationData {
    fulfillmentPriority: 'standard' | 'express' | 'rush';
    shippingInstructions?: string;
    packagingRequirements?: string;
    items: Array<{
        sku: string;
        quantity: number;
        location?: string;
    }>;
}

export interface LicenseEmailData extends BaseEmailData {
    licenseKey: string;
    organisationName: string;
    plan: string;
    validUntil: Date;
    features: string[];
    limits: {
        maxUsers: number;
        maxBranches: number;
        storageLimit: number;
        apiCallLimit: number;
        integrationLimit: number;
    };
}

export interface LicenseLimitData extends LicenseEmailData {
    metric: string;
    currentValue: number;
    limit: number;
}

export interface LicenseTransferEmailData extends BaseEmailData {
    licenseKey: string;
    transferredBy: string;
    transferDate: string;
    organizationName: string;
    newOrganizationName?: string;
    oldOrganizationName?: string;
}

export interface TaskEmailData extends BaseEmailData {
    taskId: string;
    title: string;
    description: string;
    deadline?: string;
    priority: string;
    taskType: string;
    status: string;
    assignedBy: string;
    subtasks?: Array<{
        title: string;
        status: string;
    }>;
    clients?: Array<{
        name: string;
        category?: string;
    }>;
    attachments?: Array<{
        name: string;
        url: string;
    }>;
}

export interface EmailDataMap {
    [EmailType.SIGNUP]: SignupEmailData;
    [EmailType.VERIFICATION]: VerificationEmailData;
    [EmailType.PASSWORD_RESET]: PasswordResetData;
    [EmailType.PASSWORD_CHANGED]: PasswordChangedData;
    [EmailType.INVOICE]: InvoiceData;
    [EmailType.DAILY_REPORT]: DailyReportData;
    [EmailType.NEW_QUOTATION_CLIENT]: QuotationData;
    [EmailType.NEW_QUOTATION_INTERNAL]: QuotationInternalData;
    [EmailType.NEW_QUOTATION_RESELLER]: QuotationResellerData;
    [EmailType.NEW_QUOTATION_WAREHOUSE_FULFILLMENT]: QuotationWarehouseData;
    [EmailType.QUOTATION_APPROVED]: QuotationData;
    [EmailType.QUOTATION_REJECTED]: QuotationData;
    [EmailType.LICENSE_CREATED]: LicenseEmailData;
    [EmailType.LICENSE_UPDATED]: LicenseEmailData;
    [EmailType.LICENSE_LIMIT_REACHED]: LicenseLimitData;
    [EmailType.LICENSE_RENEWED]: LicenseEmailData;
    [EmailType.LICENSE_SUSPENDED]: LicenseEmailData;
    [EmailType.LICENSE_ACTIVATED]: LicenseEmailData;
    [EmailType.LICENSE_TRANSFERRED_FROM]: LicenseTransferEmailData;
    [EmailType.LICENSE_TRANSFERRED_TO]: LicenseTransferEmailData;
    [EmailType.NEW_TASK]: TaskEmailData;
    [EmailType.TASK_UPDATED]: TaskEmailData;
}

export type EmailTemplateData<T extends EmailType> = T extends keyof EmailDataMap
    ? EmailDataMap[T]
    : never;
