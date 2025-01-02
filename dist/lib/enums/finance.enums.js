"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceStatus = exports.ClaimCategory = exports.ClaimStatus = void 0;
var ClaimStatus;
(function (ClaimStatus) {
    ClaimStatus["PENDING"] = "pending";
    ClaimStatus["APPROVED"] = "approved";
    ClaimStatus["REJECTED"] = "rejected";
    ClaimStatus["PAID"] = "paid";
    ClaimStatus["CANCELLED"] = "cancelled";
    ClaimStatus["DECLINED"] = "declined";
    ClaimStatus["DELETED"] = "deleted";
})(ClaimStatus || (exports.ClaimStatus = ClaimStatus = {}));
var ClaimCategory;
(function (ClaimCategory) {
    ClaimCategory["GENERAL"] = "general";
    ClaimCategory["TRAVEL"] = "travel";
    ClaimCategory["TRANSPORT"] = "transport";
    ClaimCategory["ACCOMMODATION"] = "accommodation";
    ClaimCategory["MEALS"] = "meals";
    ClaimCategory["ENTERTAINMENT"] = "entertainment";
    ClaimCategory["HOTEL"] = "hotel";
    ClaimCategory["OTHER"] = "other";
    ClaimCategory["PROMOTION"] = "promotion";
    ClaimCategory["EVENT"] = "event";
    ClaimCategory["ANNOUNCEMENT"] = "announcement";
    ClaimCategory["TRANSPORTATION"] = "transportation";
    ClaimCategory["OTHER_EXPENSES"] = "other expenses";
})(ClaimCategory || (exports.ClaimCategory = ClaimCategory = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["PENDING"] = "pending";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
//# sourceMappingURL=finance.enums.js.map