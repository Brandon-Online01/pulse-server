export enum EmailType {
    SIGNUP = 'signup',
    VERIFICATION = 'verification',
    PASSWORD_RESET = 'password_reset',
    PASSWORD_CHANGED = 'password_changed',
    ORDER_CONFIRMATION = 'order_confirmation',
    ORDER_OUT_FOR_DELIVERY = 'order_out_for_delivery',
    ORDER_DELIVERED = 'order_delivered',
    INVOICE = 'invoice',
    DAILY_REPORT = 'daily_report',
    ORDER_RESELLER_NOTIFICATION = 'order_reseller_notification',
    ORDER_INTERNAL_NOTIFICATION = 'order_internal_notification',
    ORDER_WAREHOUSE_FULFILLMENT = 'order_warehouse_fulfillment',
    NEW_ORDER_CLIENT = 'new_order_client',
    NEW_ORDER_INTERNAL = 'new_order_internal',
    NEW_ORDER_RESELLER = 'new_order_reseller',
    // License related emails
    LICENSE_CREATED = 'license_created',
    LICENSE_UPDATED = 'license_updated',
    LICENSE_LIMIT_REACHED = 'license_limit_reached',
    LICENSE_RENEWED = 'license_renewed',
    LICENSE_SUSPENDED = 'license_suspended',
    LICENSE_ACTIVATED = 'license_activated'
} 
