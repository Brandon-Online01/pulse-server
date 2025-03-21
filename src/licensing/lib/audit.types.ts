export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    VALIDATE = 'VALIDATE',
    TRANSFER = 'TRANSFER',
    UPGRADE = 'UPGRADE',
    DOWNGRADE = 'DOWNGRADE',
    RENEW = 'RENEW',
    SUSPEND = 'SUSPEND',
    REACTIVATE = 'REACTIVATE',
}

export interface AuditMetadata {
    ip?: string;
    userAgent?: string;
    reason?: string;
    changes?: Record<string, any>;
    [key: string]: any;
} 