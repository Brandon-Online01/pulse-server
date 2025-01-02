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
exports.ResellersController = void 0;
const common_1 = require("@nestjs/common");
const resellers_service_1 = require("./resellers.service");
const create_reseller_dto_1 = require("./dto/create-reseller.dto");
const update_reseller_dto_1 = require("./dto/update-reseller.dto");
const swagger_1 = require("@nestjs/swagger");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const user_enums_1 = require("../lib/enums/user.enums");
const role_decorator_1 = require("../decorators/role.decorator");
const swagger_2 = require("@nestjs/swagger");
let ResellersController = class ResellersController {
    constructor(resellersService) {
        this.resellersService = resellersService;
    }
    create(createResellerDto) {
        return this.resellersService.create(createResellerDto);
    }
    findAll() {
        return this.resellersService.findAll();
    }
    findOne(ref) {
        return this.resellersService.findOne(ref);
    }
    update(ref, updateResellerDto) {
        return this.resellersService.update(ref, updateResellerDto);
    }
    remove(ref) {
        return this.resellersService.remove(ref);
    }
};
exports.ResellersController = ResellersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'create a new reseller' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reseller_dto_1.CreateResellerDto]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'get all resellers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'get a reseller by reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'update a reseller' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_reseller_dto_1.UpdateResellerDto]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_2.ApiOperation)({ summary: 'soft delete a reseller' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "remove", null);
exports.ResellersController = ResellersController = __decorate([
    (0, swagger_1.ApiTags)('resellers'),
    (0, common_1.Controller)('resellers'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    __metadata("design:paramtypes", [resellers_service_1.ResellersService])
], ResellersController);
//# sourceMappingURL=resellers.controller.js.map