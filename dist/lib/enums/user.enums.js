"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = exports.AccessLevel = void 0;
var AccessLevel;
(function (AccessLevel) {
    AccessLevel["OWNER"] = "owner";
    AccessLevel["ADMIN"] = "admin";
    AccessLevel["MANAGER"] = "manager";
    AccessLevel["SUPERVISOR"] = "supervisor";
    AccessLevel["USER"] = "user";
    AccessLevel["DEVELOPER"] = "developer";
    AccessLevel["SUPPORT"] = "support";
})(AccessLevel || (exports.AccessLevel = AccessLevel = {}));
var Department;
(function (Department) {
    Department["SUPPORT"] = "support";
    Department["ENGINEERING"] = "engineering";
    Department["SALES"] = "sales";
    Department["MARKETING"] = "marketing";
    Department["FINANCE"] = "finance";
    Department["HR"] = "hr";
    Department["LEGAL"] = "legal";
    Department["OPERATIONS"] = "operations";
})(Department || (exports.Department = Department = {}));
//# sourceMappingURL=user.enums.js.map