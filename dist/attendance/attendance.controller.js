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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("./attendance.service");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const create_attendance_check_in_dto_1 = require("./dto/create-attendance-check-in.dto");
const create_attendance_check_out_dto_1 = require("./dto/create-attendance-check-out.dto");
const create_attendance_break_dto_1 = require("./dto/create-attendance-break.dto");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    checkIn(createAttendanceDto) {
        return this.attendanceService.checkIn(createAttendanceDto);
    }
    checkOut(createAttendanceDto) {
        return this.attendanceService.checkOut(createAttendanceDto);
    }
    manageBreak(breakDto) {
        return this.attendanceService.manageBreak(breakDto);
    }
    allCheckIns() {
        return this.attendanceService.allCheckIns();
    }
    checkInsByDate(date) {
        return this.attendanceService.checkInsByDate(date);
    }
    checkInsByUser(ref) {
        return this.attendanceService.checkInsByUser(ref);
    }
    checkInsByStatus(ref) {
        return this.attendanceService.checkInsByStatus(ref);
    }
    checkInsByBranch(ref) {
        return this.attendanceService.checkInsByBranch(ref);
    }
    getDailyStats(uid, date) {
        return this.attendanceService.getDailyStats(uid, date);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('in'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Check in',
        description: 'Records a user check-in for attendance tracking',
    }),
    (0, swagger_1.ApiBody)({ type: create_attendance_check_in_dto_1.CreateCheckInDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Check-in recorded successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error recording check-in' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attendance_check_in_dto_1.CreateCheckInDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('out'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Check out',
        description: 'Records a user check-out for attendance tracking',
    }),
    (0, swagger_1.ApiBody)({ type: create_attendance_check_out_dto_1.CreateCheckOutDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Check-out recorded successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error recording check-out' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attendance_check_out_dto_1.CreateCheckOutDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Post)('break'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Manage break',
        description: 'Start or end a break during a shift',
    }),
    (0, swagger_1.ApiBody)({ type: create_attendance_break_dto_1.CreateBreakDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Break action processed successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Break started/ended successfully' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error processing break action' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attendance_break_dto_1.CreateBreakDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "manageBreak", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all attendance records',
        description: 'Retrieves a list of all attendance check-ins',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Attendance records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                attendances: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            checkInTime: { type: 'string', format: 'date-time' },
                            checkOutTime: { type: 'string', format: 'date-time' },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "allCheckIns", null);
__decorate([
    (0, common_1.Get)('date/:date'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get attendance by date',
        description: 'Retrieves attendance records for a specific date',
    }),
    (0, swagger_1.ApiParam)({ name: 'date', description: 'Date in YYYY-MM-DD format', type: 'string' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Attendance records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                attendances: {
                    type: 'array',
                    items: { type: 'object' },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkInsByDate", null);
__decorate([
    (0, common_1.Get)('user/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get attendance by user',
        description: 'Retrieves attendance records for a specific user',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'User reference code', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User attendance records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                attendances: {
                    type: 'array',
                    items: { type: 'object' },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User not found' },
                attendances: { type: 'null' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkInsByUser", null);
__decorate([
    (0, common_1.Get)('status/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get attendance by status',
        description: 'Retrieves attendance records filtered by status',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Status reference code', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Status-filtered attendance records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                attendances: {
                    type: 'array',
                    items: { type: 'object' },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkInsByStatus", null);
__decorate([
    (0, common_1.Get)('branch/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get attendance by branch',
        description: 'Retrieves attendance records for a specific branch',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Branch reference code', type: 'string' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Branch attendance records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                attendances: {
                    type: 'array',
                    items: { type: 'object' },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Branch not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Branch not found' },
                attendances: { type: 'null' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkInsByBranch", null);
__decorate([
    (0, common_1.Get)('daily-stats/:uid'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get daily attendance stats',
        description: 'Retrieves work and break times for a specific user for a day',
    }),
    (0, swagger_1.ApiParam)({ name: 'uid', description: 'User ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Daily stats retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                dailyWorkTime: { type: 'number', example: 28800000 },
                dailyBreakTime: { type: 'number', example: 3600000 },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getDailyStats", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('att'),
    (0, common_1.Controller)('att'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map