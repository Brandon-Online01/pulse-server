"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const reports_controller_1 = require("./reports.controller");
const typeorm_1 = require("@nestjs/typeorm");
const report_entity_1 = require("./entities/report.entity");
const leads_module_1 = require("../leads/leads.module");
const journal_module_1 = require("../journal/journal.module");
const claims_module_1 = require("../claims/claims.module");
const tasks_module_1 = require("../tasks/tasks.module");
const shop_module_1 = require("../shop/shop.module");
const attendance_module_1 = require("../attendance/attendance.module");
const news_module_1 = require("../news/news.module");
const user_module_1 = require("../user/user.module");
const rewards_module_1 = require("../rewards/rewards.module");
const check_ins_module_1 = require("../check-ins/check-ins.module");
const tracking_module_1 = require("../tracking/tracking.module");
const check_in_entity_1 = require("../check-ins/entities/check-in.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const claim_entity_1 = require("../claims/entities/claim.entity");
const lead_entity_1 = require("../leads/entities/lead.entity");
const config_1 = require("@nestjs/config");
const licensing_module_1 = require("../licensing/licensing.module");
const journal_entity_1 = require("../journal/entities/journal.entity");
const user_entity_1 = require("../user/entities/user.entity");
const achievement_entity_1 = require("../rewards/entities/achievement.entity");
const client_entity_1 = require("../clients/entities/client.entity");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const organisation_entity_1 = require("../organisation/entities/organisation.entity");
const branch_entity_1 = require("../branch/entities/branch.entity");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            licensing_module_1.LicensingModule,
            typeorm_1.TypeOrmModule.forFeature([
                report_entity_1.Report,
                check_in_entity_1.CheckIn,
                task_entity_1.Task,
                claim_entity_1.Claim,
                lead_entity_1.Lead,
                journal_entity_1.Journal,
                user_entity_1.User,
                achievement_entity_1.Achievement,
                client_entity_1.Client,
                attendance_entity_1.Attendance,
                organisation_entity_1.Organisation,
                branch_entity_1.Branch,
            ]),
            leads_module_1.LeadsModule,
            journal_module_1.JournalModule,
            claims_module_1.ClaimsModule,
            tasks_module_1.TasksModule,
            shop_module_1.ShopModule,
            attendance_module_1.AttendanceModule,
            news_module_1.NewsModule,
            user_module_1.UserModule,
            rewards_module_1.RewardsModule,
            check_ins_module_1.CheckInsModule,
            tracking_module_1.TrackingModule,
            config_1.ConfigModule
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService],
        exports: [reports_service_1.ReportsService]
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map