"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatus = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["FINANCE"] = "finance";
    NotificationType["HR"] = "hr";
    NotificationType["PAYROLL"] = "payroll";
    NotificationType["USER"] = "user";
    NotificationType["SYSTEM"] = "system";
    NotificationType["SHOPPING"] = "shopping";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["READ"] = "read";
    NotificationStatus["UNREAD"] = "unread";
    NotificationStatus["ARCHIVED"] = "archived";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
//# sourceMappingURL=notification.enums.js.map