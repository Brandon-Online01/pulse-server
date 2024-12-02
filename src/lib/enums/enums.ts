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

    COMPLETED = 'completed',
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',

    PAID = 'paid',
    UNPAID = 'unpaid',
    PARTIAL = 'partial',
    OVERDUE = 'overdue',

    LATE = 'late',
    ON_TIME = 'on time',
    EARLY = 'early',
    OVERTIME = 'overtime',

    DRIVING = 'driving',
    PARKING = 'parking',
    STOPPED = 'stopped',
}
