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
exports.Organisation = void 0;
const status_enums_1 = require("../../lib/enums/status.enums");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const typeorm_1 = require("typeorm");
const asset_entity_1 = require("../../assets/entities/asset.entity");
const client_entity_1 = require("../../clients/entities/client.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const reseller_entity_1 = require("../../resellers/entities/reseller.entity");
const banners_entity_1 = require("../../shop/entities/banners.entity");
const news_entity_1 = require("../../news/entities/news.entity");
const journal_entity_1 = require("../../journal/entities/journal.entity");
const doc_entity_1 = require("../../docs/entities/doc.entity");
const attendance_entity_1 = require("../../attendance/entities/attendance.entity");
const claim_entity_1 = require("../../claims/entities/claim.entity");
const report_entity_1 = require("../../reports/entities/report.entity");
const quotation_entity_1 = require("../../shop/entities/quotation.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const tracking_entity_1 = require("../../tracking/entities/tracking.entity");
const communication_log_entity_1 = require("../../communication/entities/communication-log.entity");
const organisation_settings_entity_1 = require("./organisation-settings.entity");
const organisation_appearance_entity_1 = require("./organisation-appearance.entity");
const organisation_hours_entity_1 = require("./organisation-hours.entity");
let Organisation = class Organisation {
};
exports.Organisation = Organisation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Organisation.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: false }),
    __metadata("design:type", Object)
], Organisation.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Organisation.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Organisation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Organisation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: status_enums_1.GeneralStatus.ACTIVE }),
    __metadata("design:type", String)
], Organisation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: false }),
    __metadata("design:type", Boolean)
], Organisation.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "ref", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => organisation_settings_entity_1.OrganisationSettings, settings => settings.organisation),
    __metadata("design:type", organisation_settings_entity_1.OrganisationSettings)
], Organisation.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => organisation_appearance_entity_1.OrganisationAppearance, appearance => appearance.organisation),
    __metadata("design:type", organisation_appearance_entity_1.OrganisationAppearance)
], Organisation.prototype, "appearance", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => organisation_hours_entity_1.OrganisationHours, hours => hours.organisation),
    __metadata("design:type", Array)
], Organisation.prototype, "hours", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => branch_entity_1.Branch, (branch) => branch?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "branches", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asset_entity_1.Asset, (asset) => asset?.owner, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "assets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, (product) => product?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => client_entity_1.Client, (client) => client?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "clients", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reseller_entity_1.Reseller, (reseller) => reseller?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "resellers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => banners_entity_1.Banners, (banner) => banner?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "banners", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => news_entity_1.News, (news) => news?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "news", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => journal_entity_1.Journal, (journal) => journal?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "journals", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => doc_entity_1.Doc, (doc) => doc?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "docs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => claim_entity_1.Claim, (claim) => claim?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "claims", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attendance_entity_1.Attendance, (attendance) => attendance?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => report_entity_1.Report, (report) => report?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_entity_1.Quotation, (quotation) => quotation?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "quotations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tracking_entity_1.Tracking, (tracking) => tracking?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "trackings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => communication_log_entity_1.CommunicationLog, (communicationLog) => communicationLog?.organisation, { nullable: true }),
    __metadata("design:type", Array)
], Organisation.prototype, "communicationLogs", void 0);
exports.Organisation = Organisation = __decorate([
    (0, typeorm_1.Entity)('organisation')
], Organisation);
//# sourceMappingURL=organisation.entity.js.map