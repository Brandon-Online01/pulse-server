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
exports.BranchController = void 0;
const common_1 = require("@nestjs/common");
const branch_service_1 = require("./branch.service");
const create_branch_dto_1 = require("./dto/create-branch.dto");
const update_branch_dto_1 = require("./dto/update-branch.dto");
const swagger_1 = require("@nestjs/swagger");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const user_enums_1 = require("../lib/enums/user.enums");
const role_decorator_1 = require("../decorators/role.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
let BranchController = class BranchController {
    constructor(branchService) {
        this.branchService = branchService;
    }
    create(createBranchDto) {
        return this.branchService.create(createBranchDto);
    }
    findAll() {
        return this.branchService.findAll();
    }
    findOne(ref) {
        return this.branchService.findOne(ref);
    }
    update(ref, updateBranchDto) {
        return this.branchService.update(ref, updateBranchDto);
    }
    remove(ref) {
        return this.branchService.remove(ref);
    }
};
exports.BranchController = BranchController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.isPublic)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new branch',
        description: 'Creates a new branch with the provided details'
    }),
    (0, swagger_1.ApiBody)({ type: create_branch_dto_1.CreateBranchDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Branch created successfully',
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
                message: { type: 'string', example: 'Error creating branch' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_branch_dto_1.CreateBranchDto]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all branches',
        description: 'Retrieves a list of all non-deleted branches'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Branches retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                branches: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' },
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
], BranchController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a branch by reference code',
        description: 'Retrieves detailed information about a specific branch including related entities'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Branch reference code', type: 'string' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Branch details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                branch: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Branch not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Branch not found' },
                branch: { type: 'null' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a branch',
        description: 'Updates an existing branch with the provided information'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Branch reference code', type: 'string' }),
    (0, swagger_1.ApiBody)({ type: update_branch_dto_1.UpdateBranchDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Branch updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Branch not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Branch not found' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating branch' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branch_dto_1.UpdateBranchDto]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a branch',
        description: 'Marks a branch as deleted without removing it from the database'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Branch reference code', type: 'string' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Branch deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Branch not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error deleting branch' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "remove", null);
exports.BranchController = BranchController = __decorate([
    (0, swagger_1.ApiTags)('branch'),
    (0, common_1.Controller)('branch'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [branch_service_1.BranchService])
], BranchController);
//# sourceMappingURL=branch.controller.js.map