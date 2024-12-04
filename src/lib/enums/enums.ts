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
