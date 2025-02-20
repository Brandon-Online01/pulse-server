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
exports.Client = exports.CustomerType = void 0;
const status_enums_1 = require("../../lib/enums/status.enums");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const quotation_entity_1 = require("../../shop/entities/quotation.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const typeorm_1 = require("typeorm");
const check_in_entity_1 = require("../../check-ins/entities/check-in.entity");
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const branch_entity_1 = require("../../branch/entities/branch.entity");
var CustomerType;
(function (CustomerType) {
    CustomerType["STANDARD"] = "standard";
    CustomerType["PREMIUM"] = "premium";
    CustomerType["ENTERPRISE"] = "enterprise";
    CustomerType["VIP"] = "vip";
    CustomerType["WHOLESALE"] = "wholesale";
    CustomerType["CONTRACT"] = "contract";
    CustomerType["HARDWARE"] = "hardware";
    CustomerType["SOFTWARE"] = "software";
    CustomerType["SERVICE"] = "service";
    CustomerType["OTHER"] = "other";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
let Client = class Client {
};
exports.Client = Client;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Client.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Client.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: 'contract' }),
    __metadata("design:type", String)
], Client.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "alternativePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Client.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Client.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Client.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: status_enums_1.GeneralStatus.ACTIVE }),
    __metadata("design:type", String)
], Client.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Client.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Client.prototype, "ref", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user?.clients, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Client.prototype, "assignedSalesRep", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_entity_1.Lead, (lead) => lead?.client, { nullable: true }),
    __metadata("design:type", Array)
], Client.prototype, "leads", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_entity_1.Quotation, (quotation) => quotation?.client, { nullable: true }),
    __metadata("design:type", Array)
], Client.prototype, "quotations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task?.clients, { nullable: true }),
    __metadata("design:type", Array)
], Client.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => check_in_entity_1.CheckIn, (checkIn) => checkIn?.client, { nullable: true }),
    __metadata("design:type", Array)
], Client.prototype, "checkIns", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CustomerType, default: CustomerType.STANDARD }),
    __metadata("design:type", String)
], Client.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, (organisation) => organisation?.clients, { nullable: true }),
    __metadata("design:type", organisation_entity_1.Organisation)
], Client.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.clients, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], Client.prototype, "branch", void 0);
exports.Client = Client = __decorate([
    (0, typeorm_1.Entity)('client')
], Client);
//# sourceMappingURL=client.entity.js.map