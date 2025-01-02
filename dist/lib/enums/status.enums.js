"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.SubTaskStatus = exports.GeneralStatus = exports.ClaimStatus = exports.TaskStatus = exports.TrackingStatus = exports.VehicleStatus = exports.PaymentStatus = exports.AccountStatus = void 0;
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "active";
    AccountStatus["INACTIVE"] = "inactive";
    AccountStatus["DELETED"] = "deleted";
    AccountStatus["BANNED"] = "banned";
    AccountStatus["PENDING"] = "pending";
    AccountStatus["APPROVED"] = "approved";
    AccountStatus["REVIEW"] = "review";
    AccountStatus["DECLINED"] = "declined";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["UNPAID"] = "unpaid";
    PaymentStatus["PARTIAL"] = "partial";
    PaymentStatus["OVERDUE"] = "overdue";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["DRIVING"] = "driving";
    VehicleStatus["PARKING"] = "parking";
    VehicleStatus["STOPPED"] = "stopped";
})(VehicleStatus || (exports.VehicleStatus = VehicleStatus = {}));
var TrackingStatus;
(function (TrackingStatus) {
    TrackingStatus["ACTIVE"] = "active";
    TrackingStatus["INACTIVE"] = "inactive";
    TrackingStatus["DELETED"] = "deleted";
    TrackingStatus["BANNED"] = "banned";
    TrackingStatus["DEACTIVATED"] = "deactivated";
    TrackingStatus["EXPIRED"] = "expired";
})(TrackingStatus || (exports.TrackingStatus = TrackingStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["POSTPONED"] = "postponed";
    TaskStatus["MISSED"] = "missed";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["PENDING"] = "pending";
    TaskStatus["INPROGRESS"] = "inprogress";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var ClaimStatus;
(function (ClaimStatus) {
    ClaimStatus["PENDING"] = "pending";
    ClaimStatus["APPROVED"] = "approved";
    ClaimStatus["REJECTED"] = "rejected";
    ClaimStatus["PAID"] = "paid";
    ClaimStatus["CANCELLED"] = "cancelled";
})(ClaimStatus || (exports.ClaimStatus = ClaimStatus = {}));
var GeneralStatus;
(function (GeneralStatus) {
    GeneralStatus["ACTIVE"] = "active";
    GeneralStatus["INACTIVE"] = "inactive";
    GeneralStatus["DELETED"] = "deleted";
    GeneralStatus["BANNED"] = "banned";
    GeneralStatus["DEACTIVATED"] = "deactivated";
    GeneralStatus["EXPIRED"] = "expired";
    GeneralStatus["PENDING"] = "pending";
    GeneralStatus["REJECTED"] = "rejected";
    GeneralStatus["APPROVED"] = "approved";
})(GeneralStatus || (exports.GeneralStatus = GeneralStatus = {}));
var SubTaskStatus;
(function (SubTaskStatus) {
    SubTaskStatus["PENDING"] = "pending";
    SubTaskStatus["COMPLETED"] = "completed";
})(SubTaskStatus || (exports.SubTaskStatus = SubTaskStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["INPROGRESS"] = "inprogress";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["POSTPONED"] = "postponed";
    OrderStatus["OUTFORDELIVERY"] = "outfordelivery";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["REJECTED"] = "rejected";
    OrderStatus["APPROVED"] = "approved";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
//# sourceMappingURL=status.enums.js.map