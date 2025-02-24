"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPriority = exports.NotificationStatus = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["FINANCE"] = "finance";
    NotificationType["HR"] = "hr";
    NotificationType["PAYROLL"] = "payroll";
    NotificationType["USER"] = "user";
    NotificationType["SYSTEM"] = "system";
    NotificationType["SHOPPING"] = "shopping";
    NotificationType["TASK_REMINDER"] = "TASK_REMINDER";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["READ"] = "read";
    NotificationStatus["UNREAD"] = "unread";
    NotificationStatus["ARCHIVED"] = "archived";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
//# sourceMappingURL=notification.enums.js.map