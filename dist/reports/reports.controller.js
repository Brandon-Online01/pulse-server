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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reports_service_1 = require("./reports.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
const role_decorator_1 = require("../decorators/role.decorator");
const common_1 = require("@nestjs/common");
const user_enums_1 = require("../lib/enums/user.enums");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
const generate_report_dto_1 = require("./dto/generate-report.dto");
let ReportsController = ReportsController_1 = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
        this.logger = new common_1.Logger(ReportsController_1.name);
    }
    async generateReport(generateReportDto) {
        this.logger.log('Received report generation request', generateReportDto);
        try {
            const report = await this.reportsService.generateReport(generateReportDto);
            this.logger.log('Report generated successfully', { reportId: report.metadata.generatedAt });
            return report;
        }
        catch (error) {
            this.logger.error(`Failed to generate report: ${error.message}`, error.stack);
            throw error;
        }
    }
    managerDailyReport() {
        return this.reportsService.managerDailyReport();
    }
    userDailyReport(reference) {
        return this.reportsService.userDailyReport(reference);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a report based on type and filters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_report_dto_1.GenerateReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('daily-report'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'get a general company overview report with elevated access' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "managerDailyReport", null);
__decorate([
    (0, common_1.Get)('daily-report/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get daily activity report, optionally filtered for specific user roles' }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "userDailyReport", null);
exports.ReportsController = ReportsController = ReportsController_1 = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map