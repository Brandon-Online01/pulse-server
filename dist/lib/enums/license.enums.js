"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCycle = exports.LicenseStatus = exports.SubscriptionPlan = exports.LicenseType = void 0;
var LicenseType;
(function (LicenseType) {
    LicenseType["PERPETUAL"] = "perpetual";
    LicenseType["SUBSCRIPTION"] = "subscription";
    LicenseType["TRIAL"] = "trial";
    LicenseType["ENTERPRISE"] = "enterprise";
})(LicenseType || (exports.LicenseType = LicenseType = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["STARTER"] = "starter";
    SubscriptionPlan["PROFESSIONAL"] = "professional";
    SubscriptionPlan["BUSINESS"] = "business";
    SubscriptionPlan["ENTERPRISE"] = "enterprise";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var LicenseStatus;
(function (LicenseStatus) {
    LicenseStatus["ACTIVE"] = "active";
    LicenseStatus["EXPIRED"] = "expired";
    LicenseStatus["SUSPENDED"] = "suspended";
    LicenseStatus["GRACE_PERIOD"] = "grace_period";
    LicenseStatus["TRIAL"] = "trial";
})(LicenseStatus || (exports.LicenseStatus = LicenseStatus = {}));
var BillingCycle;
(function (BillingCycle) {
    BillingCycle["MONTHLY"] = "monthly";
    BillingCycle["ANNUAL"] = "annual";
    BillingCycle["CUSTOM"] = "custom";
})(BillingCycle || (exports.BillingCycle = BillingCycle = {}));
//# sourceMappingURL=license.enums.js.map