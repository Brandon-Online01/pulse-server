"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationLog = void 0;
const branch_entity_1 = require("../../branch/entities/branch.entity");
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const typeorm_1 = require("typeorm");
let CommunicationLog = class CommunicationLog {
};
exports.CommunicationLog = CommunicationLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommunicationLog.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", String)
], CommunicationLog.prototype, "emailType", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], CommunicationLog.prototype, "recipientEmails", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], CommunicationLog.prototype, "accepted", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], CommunicationLog.prototype, "rejected", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CommunicationLog.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommunicationLog.prototype, "messageSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommunicationLog.prototype, "envelopeTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommunicationLog.prototype, "messageTime", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", String)
], CommunicationLog.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], CommunicationLog.prototype, "envelope", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CommunicationLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.communicationLogs),
    __metadata("design:type", branch_entity_1.Branch)
], CommunicationLog.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, (organisation) => organisation?.communicationLogs),
    __metadata("design:type", organisation_entity_1.Organisation)
], CommunicationLog.prototype, "organisation", void 0);
exports.CommunicationLog = CommunicationLog = __decorate([
    (0, typeorm_1.Entity)('communication_logs')
], CommunicationLog);
//# sourceMappingURL=communication-log.entity.js.map