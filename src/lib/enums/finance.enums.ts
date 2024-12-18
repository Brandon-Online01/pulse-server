export enum ClaimStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PAID = 'paid',
    CANCELLED = 'cancelled',
    DECLINED = 'declined',
    DELETED = 'deleted',
}

export enum ClaimCategory {
    GENERAL = 'general',
    TRAVEL = 'travel',
    TRANSPORT = 'transport',
    ACCOMMODATION = 'accommodation',
    MEALS = 'meals',
    ENTERTAINMENT = 'entertainment',
    HOTEL = 'hotel',
    OTHER = 'other',
    PROMOTION = 'promotion',
    EVENT = 'event',
    ANNOUNCEMENT = 'announcement',
    TRANSPORTATION = 'transportation',
    OTHER_EXPENSES = 'other expenses',
}

export enum InvoiceStatus {
    PENDING = 'pending',
    PAID = 'paid',
    CANCELLED = 'cancelled',
} 