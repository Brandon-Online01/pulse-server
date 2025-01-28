import { EmailType } from "../enums/email.enums";

export interface BaseEmailData {
    name: string;
}

export interface SignupEmailData extends BaseEmailData {
    verificationLink: string;
    welcomeOffers?: string[];
}

export interface VerificationEmailData extends BaseEmailData {
    verificationLink: string;
    expiryHours: number;
}

export interface PasswordResetData extends BaseEmailData {
    resetLink: string;
    expiryMinutes: number;
}

export interface QuotationData extends BaseEmailData {
    quotationId: string;
    expectedDelivery: Date;
    total: number;
    currency: string;
    shippingMethod: string;
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

export interface PasswordChangedData extends BaseEmailData {
    date: Date;
    deviceInfo: {
        browser: string;
        os: string;
        location: string;
    };
}

export interface OrderDeliveryData extends BaseEmailData {
    orderId: string;
    estimatedDeliveryTime: Date;
    deliveryAddress: string;
    carrier: string;
    trackingNumber: string;
    deliveryInstructions?: string;
}

export interface DailyReportData {
    name: string;
    date: Date;
    metrics: {
        xp: {
            level: number;
            currentXP: number;
            todayXP: number;
        };
        attendance?: {
            startTime: string;
            endTime: string;
            totalHours: number;
            duration: string;
            status: string;
            afterHours?: number;
            checkInLocation?: {
                latitude: number;
                longitude: number;
                notes?: string;
            };
            checkOutLocation?: {
                latitude: number;
                longitude: number;
                notes?: string;
            };
            verifiedAt?: string;
            verifiedBy?: string;
        };
        checkIns?: Array<{
            time: string;
            location: string;
            photo?: boolean;
        }>;
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

export interface OrderOutForDeliveryData extends BaseEmailData {
    orderId: string;
    estimatedDeliveryTime: Date;
    deliveryAddress: string;
    carrier: string;
    trackingNumber: string;
}

export interface OrderDeliveredData extends BaseEmailData {
    orderId: string;
    deliveryDate: Date;
    deliveryStatus: string;
}

export interface QuotationResellerNotificationData extends QuotationData {
    resellerCommission: number;
    resellerCode: string;
}

export interface QuotationInternalNotificationData extends QuotationData {
    customerType: string;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    orderItems?: Array<{
        quantity: number;
        product: { uid: string, name: string };
        totalPrice: number;
    }>;
}

export interface QuotationWarehouseFulfillmentData extends QuotationData {
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
    features: Record<string, boolean>;
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

export interface QuotationData extends BaseEmailData {
    quotationId: string;
    validUntil: Date;
    total: number;
    currency: string;
    quotationItems: Array<{
        quantity: number;
        product: { uid: string };
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

export type EmailDataMap = {
    [EmailType.SIGNUP]: SignupEmailData;
    [EmailType.VERIFICATION]: VerificationEmailData;
    [EmailType.PASSWORD_RESET]: PasswordResetData;
    [EmailType.INVOICE]: InvoiceData;
    [EmailType.PASSWORD_CHANGED]: PasswordChangedData;
    [EmailType.DAILY_REPORT]: DailyReportData;
    [EmailType.NEW_QUOTATION_CLIENT]: QuotationData;
    [EmailType.NEW_QUOTATION_INTERNAL]: QuotationInternalData;
    [EmailType.NEW_QUOTATION_RESELLER]: QuotationResellerData;
    [EmailType.NEW_QUOTATION_WAREHOUSE_FULFILLMENT]: QuotationData;
    [EmailType.QUOTATION_APPROVED]: QuotationData;
    [EmailType.QUOTATION_REJECTED]: QuotationData;
    [EmailType.LICENSE_CREATED]: LicenseEmailData;
    [EmailType.LICENSE_UPDATED]: LicenseEmailData;
    [EmailType.LICENSE_LIMIT_REACHED]: LicenseLimitData;
    [EmailType.LICENSE_RENEWED]: LicenseEmailData;
    [EmailType.LICENSE_SUSPENDED]: LicenseEmailData;
    [EmailType.LICENSE_ACTIVATED]: LicenseEmailData;
};

export type EmailTemplateData<T extends EmailType> = EmailDataMap[T];
