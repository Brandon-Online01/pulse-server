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
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
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
        totalOrders: number;
        totalRevenue: number;
        newCustomers: number;
        satisfactionRate: number;
        orderGrowth: string;
        revenueGrowth: string;
        customerGrowth: string;
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

export interface DailyReportData extends BaseEmailData {
    date: Date;
    metrics: {
        totalOrders: number;
        totalRevenue: number;
        newCustomers: number;
        satisfactionRate: number;
        orderGrowth: string;
        revenueGrowth: string;
        customerGrowth: string;
    };
}