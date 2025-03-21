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
    DRAFT = 'draft',                      // Initial state when quotation is created but not ready for review
    PENDING_INTERNAL = 'pending_internal', // Awaiting internal team review
    PENDING_CLIENT = 'pending_client',     // Awaiting client review
    NEGOTIATION = 'negotiation',           // Client requested changes
    APPROVED = 'approved',                 // Client approved quotation
    REJECTED = 'rejected',                 // Client rejected quotation
    SOURCING = 'sourcing',                 // Sourcing products
    PACKING = 'packing',                   // Packing order
    IN_FULFILLMENT = 'in_fulfillment',     // Converting to order/fulfillment
    PAID = 'paid',                         // Payment received
    OUTFORDELIVERY = 'outfordelivery',     // Out for delivery
    DELIVERED = 'delivered',               // Delivered to client
    RETURNED = 'returned',                 // Products returned by client
    COMPLETED = 'completed',               // Order fully completed
    CANCELLED = 'cancelled',               // Order cancelled
    POSTPONED = 'postponed',               // Temporary hold
    INPROGRESS = 'inprogress',             // Being processed (legacy - keep for backward compatibility)
    PENDING = 'pending',                   // Legacy status - keep for backward compatibility
}
