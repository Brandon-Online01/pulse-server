"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepetitionType = exports.Priority = exports.TaskType = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["INPROGRESS"] = "inprogress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["REVIEW"] = "review";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskType;
(function (TaskType) {
    TaskType["CALL"] = "call";
    TaskType["MEETING"] = "meeting";
    TaskType["INPERSON"] = "inperson";
    TaskType["ONLINE"] = "online";
    TaskType["SUPPORT"] = "support";
    TaskType["OTHER"] = "other";
})(TaskType || (exports.TaskType = TaskType = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["URGENT"] = "urgent";
})(Priority || (exports.Priority = Priority = {}));
var RepetitionType;
(function (RepetitionType) {
    RepetitionType["DAILY"] = "daily";
    RepetitionType["WEEKLY"] = "weekly";
    RepetitionType["MONTHLY"] = "monthly";
    RepetitionType["YEARLY"] = "yearly";
})(RepetitionType || (exports.RepetitionType = RepetitionType = {}));
//# sourceMappingURL=task.enums.js.map