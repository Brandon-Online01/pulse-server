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
const licensing_module_1 = require("../licensing/licensing.module");
const tracking_module_1 = require("../tracking/tracking.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            licensing_module_1.LicensingModule,
            typeorm_1.TypeOrmModule.forFeature([report_entity_1.Report]),
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
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService],
        exports: [reports_service_1.ReportsService]
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map