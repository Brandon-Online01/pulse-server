// User & Access Management
export enum AccessLevel {
    OWNER = 'owner',
    ADMIN = 'admin',
    MANAGER = 'manager',
    SUPERVISOR = 'supervisor',
    SUPPORT = 'support',
    DEVELOPER = 'developer',
    USER = 'user',
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

// General Status Enums
export enum Status {
    // Account Status
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    BANNED = 'banned',
    DEACTIVATED = 'deactivated',
    EXPIRED = 'expired',

    // Payment Status
    PAID = 'paid',
    UNPAID = 'unpaid',
    PARTIAL = 'partial',
    OVERDUE = 'overdue',

    // Vehicle Status
    DRIVING = 'driving',
    PARKING = 'parking',
    STOPPED = 'stopped',

    // Task Status
    POSTPONED = 'postponed',
    MISSED = 'missed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
    APPROVED = 'approved',
    REVIEW = 'review',
    DECLINED = 'declined',
}

// Attendance & Tasks
export enum AttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    EXCUSED = 'excused',
    COMPLETED = 'completed',
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

// Claims & Finance
export enum ClaimStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    IN_REVIEW = 'in review',
    REJECTED = 'rejected',
    PAID = 'paid',
    DELETED = 'deleted',
    DECLINED = 'declined',
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

// Products & Resellers
export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    HIDDEN = 'hidden',
    SPECIAL = 'special',
    PROMOTIONAL = 'promotion',
    BEST_SELLER = 'bestseller',
    DISCONTINUED = 'discontinued',
    DISCOUNTED = 'discounted',
    NORMAL = 'normal',
    NEW = 'new',
    HOTDEALS = 'hotdeals',
}

export enum ResellerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

// Notifications
export enum NotificationType {
    FINANCE = 'finance',
    HR = 'hr',
    PAYROLL = 'payroll',
    USER = 'user',
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
}

export enum NotificationStatus {
    READ = 'read',
    UNREAD = 'unread',
    ARCHIVED = 'archived',
}

// Task Management
export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum RepetitionType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly'
}

export enum AttachmentType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    VIDEO = 'video',
    AUDIO = 'audio',
    OTHER = 'other'
}

export enum NewsCategory {
    HR = "Human Resources",
    FINANCE = "Finance",
    OPERATIONS = "Operations",
    IT = "Information Technology",
    MARKETING = "Marketing",
    SALES = "Sales",
    LEGAL = "Legal",
    EXECUTIVE = "Executive",
    GENERAL = "General"
}

export enum ClaimCategory {
    GENERAL = 'general',
    PROMOTION = 'promotion',
    EVENT = 'event',
    ANNOUNCEMENT = 'announcement',
    OTHER = 'other',
    HOTEL = 'hotel',
    TRAVEL = 'travel',
    TRANSPORT = 'transport',
    OTHER_EXPENSES = 'other_expenses',
    ACCOMMODATION = 'accommodation',
    MEALS = 'meals',
    TRANSPORTATION = 'transportation',
    ENTERTAINMENT = 'entertainment',
}