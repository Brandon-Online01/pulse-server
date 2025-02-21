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
exports.User = void 0;
const user_enums_1 = require("../../lib/enums/user.enums");
const status_enums_1 = require("../../lib/enums/status.enums");
const user_profile_entity_1 = require("./user.profile.entity");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const claim_entity_1 = require("../../claims/entities/claim.entity");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const doc_entity_1 = require("../../docs/entities/doc.entity");
const journal_entity_1 = require("../../journal/entities/journal.entity");
const news_entity_1 = require("../../news/entities/news.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const client_entity_1 = require("../../clients/entities/client.entity");
const quotation_entity_1 = require("../../shop/entities/quotation.entity");
const check_in_entity_1 = require("../../check-ins/entities/check-in.entity");
const tracking_entity_1 = require("../../tracking/entities/tracking.entity");
const asset_entity_1 = require("../../assets/entities/asset.entity");
const report_entity_1 = require("../../reports/entities/report.entity");
const user_rewards_entity_1 = require("../../rewards/entities/user-rewards.entity");
const attendance_entity_1 = require("../../attendance/entities/attendance.entity");
const user_employeement_profile_entity_1 = require("./user.employeement.profile.entity");
const organisation_entity_1 = require("../../organisation/entities/organisation.entity");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const typeorm_1 = require("typeorm");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "surname", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png' }),
    __metadata("design:type", String)
], User.prototype, "photoURL", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_enums_1.AccessLevel }),
    __metadata("design:type", String)
], User.prototype, "accessLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "userref", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organisation_entity_1.Organisation, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'organisationRef' }),
    __metadata("design:type", organisation_entity_1.Organisation)
], User.prototype, "organisation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "organisationRef", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: status_enums_1.AccountStatus, default: status_enums_1.AccountStatus.PENDING }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "verificationToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "resetToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "tokenExpires", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_profile_entity_1.UserProfile, (userProfile) => userProfile?.owner, { nullable: true }),
    __metadata("design:type", user_profile_entity_1.UserProfile)
], User.prototype, "userProfile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_employeement_profile_entity_1.UserEmployeementProfile, (userEmployeementProfile) => userEmployeementProfile?.owner, { nullable: true }),
    __metadata("design:type", user_employeement_profile_entity_1.UserEmployeementProfile)
], User.prototype, "userEmployeementProfile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attendance_entity_1.Attendance, (attendance) => attendance?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "userAttendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => claim_entity_1.Claim, (claim) => claim?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "userClaims", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => doc_entity_1.Doc, (doc) => doc?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "userDocs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_entity_1.Lead, (lead) => lead?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "leads", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => journal_entity_1.Journal, (journal) => journal?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "journals", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task?.creator, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "userTasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task?.assignees, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "assignedTasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => news_entity_1.News, (news) => news?.author, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "articles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asset_entity_1.Asset, (asset) => asset?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "assets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tracking_entity_1.Tracking, (tracking) => tracking?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "trackings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_entity_1.Quotation, (quotation) => quotation?.placedBy, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "quotations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch?.users),
    __metadata("design:type", branch_entity_1.Branch)
], User.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => client_entity_1.Client, (client) => client?.assignedSalesRep, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "clients", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => check_in_entity_1.CheckIn, (checkIn) => checkIn?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "checkIns", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_rewards_entity_1.UserRewards, (userRewards) => userRewards?.owner, { nullable: true }),
    __metadata("design:type", user_rewards_entity_1.UserRewards)
], User.prototype, "rewards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => report_entity_1.Report, (report) => report?.owner, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task?.creator, { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "tasks", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map