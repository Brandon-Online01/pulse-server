"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskType = exports.RepetitionType = exports.TaskPriority = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
    TaskStatus["OVERDUE"] = "OVERDUE";
    TaskStatus["POSTPONED"] = "POSTPONED";
    TaskStatus["MISSED"] = "MISSED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var RepetitionType;
(function (RepetitionType) {
    RepetitionType["NONE"] = "NONE";
    RepetitionType["DAILY"] = "DAILY";
    RepetitionType["WEEKLY"] = "WEEKLY";
    RepetitionType["MONTHLY"] = "MONTHLY";
    RepetitionType["YEARLY"] = "YEARLY";
})(RepetitionType || (exports.RepetitionType = RepetitionType = {}));
var TaskType;
(function (TaskType) {
    TaskType["IN_PERSON_MEETING"] = "IN_PERSON_MEETING";
    TaskType["VIRTUAL_MEETING"] = "VIRTUAL_MEETING";
    TaskType["CALL"] = "CALL";
    TaskType["EMAIL"] = "EMAIL";
    TaskType["WHATSAPP"] = "WHATSAPP";
    TaskType["SMS"] = "SMS";
    TaskType["FOLLOW_UP"] = "FOLLOW_UP";
    TaskType["PROPOSAL"] = "PROPOSAL";
    TaskType["REPORT"] = "REPORT";
    TaskType["QUOTATION"] = "QUOTATION";
    TaskType["VISIT"] = "VISIT";
    TaskType["OTHER"] = "OTHER";
})(TaskType || (exports.TaskType = TaskType = {}));
//# sourceMappingURL=task.enums.js.map