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
exports.Branch = void 0;
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const status_enums_1 = require("../../lib/enums/status.enums");
const typeorm_1 = require("typeorm");
const tracking_entity_1 = require("../../tracking/entities/tracking.entity");
const news_entity_1 = require("../../news/entities/news.entity");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const journal_entity_1 = require("../../journal/entities/journal.entity");
const doc_entity_1 = require("../../docs/entities/doc.entity");
const claim_entity_1 = require("../../claims/entities/claim.entity");
const attendance_entity_1 = require("../../attendance/entities/attendance.entity");
const asset_entity_1 = require("../../assets/entities/asset.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const check_in_entity_1 = require("../../check-ins/entities/check-in.entity");
const report_entity_1 = require("../../reports/entities/report.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const client_entity_1 = require("../../clients/entities/client.entity");
const reseller_entity_1 = require("../../resellers/entities/reseller.entity");
const banners_entity_1 = require("../../shop/entities/banners.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const quotation_entity_1 = require("../../shop/entities/quotation.entity");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const communication_log_entity_1 = require("../../communication/entities/communication-log.entity");
const route_entity_1 = require("../../tasks/entities/route.entity");
let Branch = class Branch {
};
exports.Branch = Branch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Branch.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Branch.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Branch.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Branch.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Branch.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Branch.prototype, "ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: false }),
    __metadata("design:type", Object)
], Branch.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Branch.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: status_enums_1.GeneralStatus.ACTIVE }),
    __metadata("design:type", String)
], Branch.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: false }),
    __metadata("design:type", Boolean)
], Branch.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Branch.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Branch.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, (organisation) => organisation?.branches, { nullable: true }),
    __metadata("design:type", organisation_entity_1.Organisation)
], Branch.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tracking_entity_1.Tracking, (tracking) => tracking?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "trackings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => banners_entity_1.Banners, (banner) => banner?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "banners", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => news_entity_1.News, (news) => news?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "news", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_entity_1.Lead, (lead) => lead?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "leads", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => journal_entity_1.Journal, (journal) => journal?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "journals", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => doc_entity_1.Doc, (doc) => doc?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "docs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => claim_entity_1.Claim, (claim) => claim?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "claims", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attendance_entity_1.Attendance, (attendance) => attendance?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asset_entity_1.Asset, (asset) => asset?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "assets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => check_in_entity_1.CheckIn, (checkIn) => checkIn?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "checkIns", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => report_entity_1.Report, (report) => report?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, (product) => product?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => client_entity_1.Client, (client) => client?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "clients", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reseller_entity_1.Reseller, (reseller) => reseller?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "resellers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task.branch),
    __metadata("design:type", Array)
], Branch.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => route_entity_1.Route, (route) => route.branch),
    __metadata("design:type", Array)
], Branch.prototype, "routes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_entity_1.Quotation, (quotation) => quotation?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "quotations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => communication_log_entity_1.CommunicationLog, (communicationLog) => communicationLog?.branch, { nullable: true }),
    __metadata("design:type", Array)
], Branch.prototype, "communicationLogs", void 0);
exports.Branch = Branch = __decorate([
    (0, typeorm_1.Entity)('branch')
], Branch);
//# sourceMappingURL=branch.entity.js.map