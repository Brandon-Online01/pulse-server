export enum ClientType {
    HARDWARE = 'HARDWARE',
    HEALTHCARE = 'HEALTHCARE',
    FINANCE = 'FINANCE',
    RETAIL = 'RETAIL',
    EDUCATION = 'EDUCATION',
    TECHNOLOGY = 'TECHNOLOGY',
    MANUFACTURING = 'MANUFACTURING',
    SERVICES = 'SERVICES',
    STANDARD = 'standard',
    PREMIUM = 'premium',
    ENTERPRISE = 'enterprise',
    VIP = 'vip',
    WHOLESALE = 'wholesale',
    CONTRACT = 'contract',
    SOFTWARE = 'software',
    SERVICE = 'service',
    OTHER = 'other'
}

export enum ClientStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    CONVERTED = 'converted'
}

export enum ClientContactPreference {
    EMAIL = 'email',
    PHONE = 'phone',
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
    IN_PERSON = 'in-person',
    MAIL = 'mail',
    VIDEO_CALL = 'video-call'
}

export enum PriceTier {
    STANDARD = 'standard',
    DISCOUNT = 'discount',
    PREMIUM = 'premium',
    WHOLESALE = 'wholesale',
    ENTERPRISE = 'enterprise',
    CUSTOM = 'custom',
    VIP = 'vip'
}

export enum AcquisitionChannel {
    REFERRAL = 'referral',
    DIRECT = 'direct',
    SOCIAL_MEDIA = 'social_media',
    ONLINE_AD = 'online_ad',
    ORGANIC_SEARCH = 'organic_search',
    EMAIL_CAMPAIGN = 'email_campaign',
    TRADE_SHOW = 'trade_show',
    COLD_CALL = 'cold_call',
    PARTNER = 'partner',
    OTHER = 'other'
}

export enum ClientRiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum PaymentMethod {
    BANK_TRANSFER = 'bank_transfer',
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    CASH = 'cash',
    CHECK = 'check',
    MOBILE_PAYMENT = 'mobile_payment',
    PAYPAL = 'paypal',
    INVOICE = 'invoice'
}

export enum GeofenceType {
    NONE = 'none',
    NOTIFY = 'notify',
    ALERT = 'alert',
    RESTRICTED = 'restricted',
}