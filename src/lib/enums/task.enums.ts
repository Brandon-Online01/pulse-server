export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    OVERDUE = 'OVERDUE'
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum RepetitionType {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
}

export enum TaskType {
    MEETING = 'MEETING',
    CALL = 'CALL',
    EMAIL = 'EMAIL',
    FOLLOW_UP = 'FOLLOW_UP',
    PROPOSAL = 'PROPOSAL',
    REPORT = 'REPORT',
    OTHER = 'OTHER'
} 