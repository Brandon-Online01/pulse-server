export enum TaskStatus {
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REVIEW = 'review',
}

export enum TaskType {
    CALL = 'call',
    MEETING = 'meeting',
    INPERSON = 'inperson',
    ONLINE = 'online',
    SUPPORT = 'support',
    OTHER = 'other',
}

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