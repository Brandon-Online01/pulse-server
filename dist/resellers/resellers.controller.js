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
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
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
    restore(ref) {
        return this.resellersService.restore(ref);
    }
    remove(ref) {
        return this.resellersService.remove(ref);
    }
};
exports.ResellersController = ResellersController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new reseller',
        description: 'Creates a new reseller with the provided details including contact information and address'
    }),
    (0, swagger_1.ApiBody)({ type: create_reseller_dto_1.CreateResellerDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Reseller created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error creating reseller' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reseller_dto_1.CreateResellerDto]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all resellers',
        description: 'Retrieves a list of all resellers'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of resellers retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                resellers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a reseller by reference code',
        description: 'Retrieves detailed information about a specific reseller'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Reseller reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reseller details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                reseller: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Reseller not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Reseller not found' },
                reseller: { type: 'null' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a reseller',
        description: 'Updates an existing reseller with the provided information'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Reseller reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_reseller_dto_1.UpdateResellerDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reseller updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Reseller not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Reseller not found' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating reseller' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_reseller_dto_1.UpdateResellerDto]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a deleted reseller',
        description: 'Restores a previously deleted reseller'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Reseller reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reseller restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Reseller not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Reseller not found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a reseller',
        description: 'Marks a reseller as deleted without removing it from the database'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Reseller reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reseller deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Reseller not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error deleting reseller' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResellersController.prototype, "remove", null);
exports.ResellersController = ResellersController = __decorate([
    (0, swagger_1.ApiTags)('resellers'),
    (0, common_1.Controller)('resellers'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('resellers'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [resellers_service_1.ResellersService])
], ResellersController);
//# sourceMappingURL=resellers.controller.js.map