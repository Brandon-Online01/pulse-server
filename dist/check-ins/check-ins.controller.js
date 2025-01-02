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
exports.CheckInsController = void 0;
const common_1 = require("@nestjs/common");
const check_ins_service_1 = require("./check-ins.service");
const create_check_in_dto_1 = require("./dto/create-check-in.dto");
const create_check_out_dto_1 = require("./dto/create-check-out.dto");
const user_enums_1 = require("../lib/enums/user.enums");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
let CheckInsController = class CheckInsController {
    constructor(checkInsService) {
        this.checkInsService = checkInsService;
    }
    checkIn(createCheckInDto) {
        return this.checkInsService.checkIn(createCheckInDto);
    }
    checkInStatus(reference) {
        return this.checkInsService.checkInStatus(reference);
    }
    checkOut(createCheckOutDto) {
        return this.checkInsService.checkOut(createCheckOutDto);
    }
};
exports.CheckInsController = CheckInsController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'manage attendance, check in' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_check_in_dto_1.CreateCheckInDto]),
    __metadata("design:returntype", void 0)
], CheckInsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Get)('status/:reference'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get check ins' }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CheckInsController.prototype, "checkInStatus", null);
__decorate([
    (0, common_1.Patch)(':reference'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'manage attendance, check out' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_check_out_dto_1.CreateCheckOutDto]),
    __metadata("design:returntype", void 0)
], CheckInsController.prototype, "checkOut", null);
exports.CheckInsController = CheckInsController = __decorate([
    (0, swagger_1.ApiTags)('check-ins'),
    (0, common_1.Controller)('check-ins'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    __metadata("design:paramtypes", [check_ins_service_1.CheckInsService])
], CheckInsController);
//# sourceMappingURL=check-ins.controller.js.map