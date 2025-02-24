export enum EmailType {
    SIGNUP = 'signup',
    VERIFICATION = 'verification',
    PASSWORD_RESET = 'password_reset',
    PASSWORD_CHANGED = 'password_changed',
    INVOICE = 'invoice',
    DAILY_REPORT = 'daily_report',
    // Quotation related emails
    NEW_QUOTATION_CLIENT = 'new_quotation_client',
    NEW_QUOTATION_INTERNAL = 'new_quotation_internal',
    NEW_QUOTATION_RESELLER = 'new_quotation_reseller',
    NEW_QUOTATION_WAREHOUSE_FULFILLMENT = 'new_quotation_warehouse_fulfillment',
    QUOTATION_APPROVED = 'quotation_approved',
    QUOTATION_REJECTED = 'quotation_rejected',
    // License related emails
    LICENSE_CREATED = 'license_created',
    LICENSE_UPDATED = 'license_updated',
    LICENSE_LIMIT_REACHED = 'license_limit_reached',
    LICENSE_RENEWED = 'license_renewed',
    LICENSE_SUSPENDED = 'license_suspended',
    LICENSE_ACTIVATED = 'license_activated',
    LICENSE_TRANSFERRED_FROM = 'license.transferred.from',
    LICENSE_TRANSFERRED_TO = 'license.transferred.to',
    // Task related emails
    NEW_TASK = 'new_task',
    TASK_UPDATED = 'task_updated',
    TASK_REMINDER_ASSIGNEE = 'TASK_REMINDER_ASSIGNEE',
    TASK_REMINDER_CREATOR = 'TASK_REMINDER_CREATOR'
} 
