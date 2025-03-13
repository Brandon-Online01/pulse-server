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
exports.ClaimsController = void 0;
const common_1 = require("@nestjs/common");
const claims_service_1 = require("./claims.service");
const create_claim_dto_1 = require("./dto/create-claim.dto");
const update_claim_dto_1 = require("./dto/update-claim.dto");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
let ClaimsController = class ClaimsController {
    constructor(claimsService) {
        this.claimsService = claimsService;
    }
    create(createClaimDto) {
        return this.claimsService.create(createClaimDto);
    }
    findAll() {
        return this.claimsService.findAll();
    }
    findOne(ref) {
        return this.claimsService.findOne(ref);
    }
    update(ref, updateClaimDto) {
        return this.claimsService.update(ref, updateClaimDto);
    }
    restore(ref) {
        return this.claimsService.restore(ref);
    }
    claimsByUser(ref) {
        return this.claimsService.claimsByUser(ref);
    }
    remove(ref) {
        return this.claimsService.remove(ref);
    }
};
exports.ClaimsController = ClaimsController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new claim',
        description: 'Creates a new claim with the provided data. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiBody)({ type: create_claim_dto_1.CreateClaimDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Claim created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        title: { type: 'string', example: 'Expense Reimbursement' },
                        description: { type: 'string', example: 'Claim for business travel expenses' },
                        amount: { type: 'number', example: 1250.50 },
                        status: { type: 'string', example: 'PENDING' },
                        claimRef: { type: 'string', example: 'CLM123456' },
                        attachments: {
                            type: 'array',
                            items: {
                                type: 'string',
                                example: 'https://example.com/receipt.pdf'
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        isDeleted: { type: 'boolean', example: false },
                        owner: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'John Doe' }
                            }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_claim_dto_1.CreateClaimDto]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all claims',
        description: 'Retrieves all claims. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of all claims',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            title: { type: 'string', example: 'Expense Reimbursement' },
                            description: { type: 'string', example: 'Claim for business travel expenses' },
                            amount: { type: 'number', example: 1250.50 },
                            status: { type: 'string', example: 'PENDING' },
                            claimRef: { type: 'string', example: 'CLM123456' },
                            attachments: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    example: 'https://example.com/receipt.pdf'
                                }
                            },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                            isDeleted: { type: 'boolean', example: false }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 10 }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a claim by reference code',
        description: 'Retrieves a specific claim by its reference code. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Claim reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Claim found',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        title: { type: 'string', example: 'Expense Reimbursement' },
                        description: { type: 'string', example: 'Claim for business travel expenses' },
                        amount: { type: 'number', example: 1250.50 },
                        status: { type: 'string', example: 'PENDING' },
                        claimRef: { type: 'string', example: 'CLM123456' },
                        attachments: {
                            type: 'array',
                            items: {
                                type: 'string',
                                example: 'https://example.com/receipt.pdf'
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        isDeleted: { type: 'boolean', example: false },
                        owner: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john.doe@example.com' }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Claim not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a claim',
        description: 'Updates a specific claim by its reference code. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Claim reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiBody)({ type: update_claim_dto_1.UpdateClaimDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Claim updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Claim not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_claim_dto_1.UpdateClaimDto]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a deleted claim',
        description: 'Restores a previously deleted claim. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Claim reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Claim restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Claim not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get claims by user reference code',
        description: 'Retrieves all claims associated with a specific user. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'User reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of claims for the specified user',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            title: { type: 'string', example: 'Expense Reimbursement' },
                            description: { type: 'string', example: 'Claim for business travel expenses' },
                            amount: { type: 'number', example: 1250.50 },
                            status: { type: 'string', example: 'PENDING' },
                            claimRef: { type: 'string', example: 'CLM123456' },
                            attachments: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    example: 'https://example.com/receipt.pdf'
                                }
                            },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                            isDeleted: { type: 'boolean', example: false }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 5 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found or has no claims' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "claimsByUser", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a claim',
        description: 'Performs a soft delete on a claim. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Claim reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Claim deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Claim not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "remove", null);
exports.ClaimsController = ClaimsController = __decorate([
    (0, swagger_1.ApiTags)('claims'),
    (0, common_1.Controller)('claims'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('claims'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized access due to invalid credentials or missing token' }),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService])
], ClaimsController);
//# sourceMappingURL=claims.controller.js.map