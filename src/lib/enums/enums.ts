export enum AccessLevel {
    OWNER = 'owner',
    ADMIN = 'admin',
    MANAGER = 'manager',
    SUPERVISOR = 'supervisor',
    SUPPORT = 'support',
    DEVELOPER = 'developer',
    USER = 'user',
}

export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    BANNED = 'banned',
    DEACTIVATED = 'deactivated',

    EXPIRED = 'expired',

    PAID = 'paid',
    UNPAID = 'unpaid',
    PARTIAL = 'partial',
    OVERDUE = 'overdue',

    DRIVING = 'driving',
    PARKING = 'parking',
    STOPPED = 'stopped',

    POSTPONED = 'postponed',
    MISSED = 'missed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
}

export enum AttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    EXCUSED = 'excused',
    COMPLETED = 'completed',
}

export enum ClaimStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PAID = 'paid',
    DELETED = 'deleted',
    DECLINED = 'declined',
}

export enum TaskType {
    CALL = 'call',
    MEETING = 'meeting',
    INPERSON = 'inperson',
    ONLINE = 'online',
    SUPPORT = 'support',
    INSPECTION = 'inspection',
    REVIEW = 'review',
    OTHER = 'other',
}

export enum Department {
    SUPPORT = 'support',
    ENGINEERING = 'engineering',
    BUSINESS_DEVELOPMENT = 'business_development',
    SALES = 'sales',
    MARKETING = 'marketing',
    ADMINISTRATION = 'administration',
    FINANCE = 'finance',
    HR = 'hr',
    LEGAL = 'legal',
    OPERATIONS = 'operations',
    SECURITY = 'security',
}


export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    HIDDEN = 'hidden',
    SPECIAL = 'special',
    PROMOTIONAL = 'promotional',
    BEST_SELLER = 'best_seller',
    DISCONTINUED = 'discontinued',
    DISCOUNTED = 'discounted',
    NORMAL = 'normal',
}

export enum InvoiceStatus {
    PENDING = 'pending',
    PAID = 'paid',
    CANCELLED = 'cancelled',
}

export enum InvoiceRecipient {
    RESELLER = 'reseller',
    BUYER = 'buyer',
}

export enum ResellerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}


export enum NotificationType {
    ORDER = 'order',
    CLAIM = 'claim',
    TASK = 'task',
    GENERAL = 'general',
    REMINDER = 'reminder',
}
