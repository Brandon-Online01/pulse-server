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

export interface OrderData extends BaseEmailData {
    orderId: string;
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

export interface DailyReportData extends BaseEmailData {
    date: Date;
    metrics: {
        xp?: {
            level: number;
            currentXP: number;
            todayXP: number;
        };
        attendance?: {
            startTime: string;
            endTime?: string;
            totalHours: number;
            afterHours?: number;
            duration?: string;
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
            status: string;
            verifiedAt?: string;
            verifiedBy?: string;
        };
        checkIns?: Array<{
            time: string;
            location: string;
            photo?: boolean;
        }>;
        totalOrders: number;
        totalRevenue: string;
        newCustomers: number;
        orderGrowth: string;
        revenueGrowth: string;
        customerGrowth: string;
        userSpecific?: {
            todayLeads: number;
            todayClaims: number;
            todayTasks: number;
            todayOrders: number;
            hoursWorked: number;
        };
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

export interface OrderResellerNotificationData extends OrderData {
    resellerCommission: number;
    resellerCode: string;
}

export interface OrderInternalNotificationData extends OrderData {
    customerType: string;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    orderItems?: Array<{
        quantity: number;
        product: { uid: string, name: string };
        totalPrice: number;
    }>;
}

export interface OrderWarehouseFulfillmentData extends OrderData {
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

export type EmailDataMap = {
    [EmailType.SIGNUP]: SignupEmailData;
    [EmailType.VERIFICATION]: VerificationEmailData;
    [EmailType.PASSWORD_RESET]: PasswordResetData;
    [EmailType.ORDER_CONFIRMATION]: OrderData;
    [EmailType.INVOICE]: InvoiceData;
    [EmailType.PASSWORD_CHANGED]: PasswordChangedData;
    [EmailType.ORDER_OUT_FOR_DELIVERY]: OrderOutForDeliveryData;
    [EmailType.ORDER_DELIVERED]: OrderDeliveredData;
    [EmailType.DAILY_REPORT]: DailyReportData;
    [EmailType.ORDER_RESELLER_NOTIFICATION]: OrderResellerNotificationData;
    [EmailType.ORDER_INTERNAL_NOTIFICATION]: OrderInternalNotificationData;
    [EmailType.ORDER_WAREHOUSE_FULFILLMENT]: OrderWarehouseFulfillmentData;
    [EmailType.NEW_ORDER_CLIENT]: OrderData;
    [EmailType.NEW_ORDER_INTERNAL]: OrderInternalNotificationData;
    [EmailType.NEW_ORDER_RESELLER]: OrderResellerNotificationData;
    [EmailType.LICENSE_CREATED]: LicenseEmailData;
    [EmailType.LICENSE_UPDATED]: LicenseEmailData;
    [EmailType.LICENSE_LIMIT_REACHED]: LicenseLimitData;
    [EmailType.LICENSE_RENEWED]: LicenseEmailData;
    [EmailType.LICENSE_SUSPENDED]: LicenseEmailData;
    [EmailType.LICENSE_ACTIVATED]: LicenseEmailData;
};

export type EmailTemplateData<T extends EmailType> = EmailDataMap[T];
