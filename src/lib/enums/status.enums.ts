export enum AccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    BANNED = 'banned',
    PENDING = 'pending',
    APPROVED = 'approved',
    REVIEW = 'review',
    DECLINED = 'declined',
}

export enum PaymentStatus {
    PAID = 'paid',
    UNPAID = 'unpaid',
    PARTIAL = 'partial',
    OVERDUE = 'overdue',
}

export enum VehicleStatus {
    DRIVING = 'driving',
    PARKING = 'parking',
    STOPPED = 'stopped',
}

export enum TrackingStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    BANNED = 'banned',
    DEACTIVATED = 'deactivated',
    EXPIRED = 'expired',
}

export enum TaskStatus {
    POSTPONED = 'postponed',
    MISSED = 'missed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
}

export enum ClaimStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PAID = 'paid',
    CANCELLED = 'cancelled',
}

export enum GeneralStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    BANNED = 'banned',
    DEACTIVATED = 'deactivated',
    EXPIRED = 'expired',
    PENDING = 'pending',
    REJECTED = 'rejected',
    APPROVED = 'approved',
}

export enum SubTaskStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
}

export enum OrderStatus {
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed',
    OUTFORDELIVERY = 'outfordelivery',
    DELIVERED = 'delivered',
    REJECTED = 'rejected',
    APPROVED = 'approved',
}
