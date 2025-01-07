"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailType = void 0;
var EmailType;
(function (EmailType) {
    EmailType["SIGNUP"] = "signup";
    EmailType["VERIFICATION"] = "verification";
    EmailType["PASSWORD_RESET"] = "password_reset";
    EmailType["PASSWORD_CHANGED"] = "password_changed";
    EmailType["ORDER_CONFIRMATION"] = "order_confirmation";
    EmailType["ORDER_OUT_FOR_DELIVERY"] = "order_out_for_delivery";
    EmailType["ORDER_DELIVERED"] = "order_delivered";
    EmailType["INVOICE"] = "invoice";
    EmailType["DAILY_REPORT"] = "daily_report";
    EmailType["ORDER_RESELLER_NOTIFICATION"] = "order_reseller_notification";
    EmailType["ORDER_INTERNAL_NOTIFICATION"] = "order_internal_notification";
    EmailType["ORDER_WAREHOUSE_FULFILLMENT"] = "order_warehouse_fulfillment";
    EmailType["NEW_ORDER_CLIENT"] = "new_order_client";
    EmailType["NEW_ORDER_INTERNAL"] = "new_order_internal";
    EmailType["NEW_ORDER_RESELLER"] = "new_order_reseller";
    EmailType["LICENSE_CREATED"] = "license_created";
    EmailType["LICENSE_UPDATED"] = "license_updated";
    EmailType["LICENSE_LIMIT_REACHED"] = "license_limit_reached";
    EmailType["LICENSE_RENEWED"] = "license_renewed";
    EmailType["LICENSE_SUSPENDED"] = "license_suspended";
    EmailType["LICENSE_ACTIVATED"] = "license_activated";
})(EmailType || (exports.EmailType = EmailType = {}));
//# sourceMappingURL=email.enums.js.map