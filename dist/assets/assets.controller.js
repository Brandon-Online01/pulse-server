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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const assets_service_1 = require("./assets.service");
const create_asset_dto_1 = require("./dto/create-asset.dto");
const update_asset_dto_1 = require("./dto/update-asset.dto");
const swagger_1 = require("@nestjs/swagger");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const user_enums_1 = require("../lib/enums/user.enums");
const role_decorator_1 = require("../decorators/role.decorator");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    create(createAssetDto) {
        return this.assetsService.create(createAssetDto);
    }
    findAll() {
        return this.assetsService.findAll();
    }
    findOne(ref) {
        return this.assetsService.findOne(ref);
    }
    findBySearchTerm(query) {
        return this.assetsService.findBySearchTerm(query);
    }
    assetsByUser(ref) {
        return this.assetsService.assetsByUser(ref);
    }
    update(ref, updateAssetDto) {
        return this.assetsService.update(ref, updateAssetDto);
    }
    restore(ref) {
        return this.assetsService.restore(ref);
    }
    remove(ref) {
        return this.assetsService.remove(ref);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new asset',
        description: 'Creates a new asset with the provided details'
    }),
    (0, swagger_1.ApiBody)({ type: create_asset_dto_1.CreateAssetDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Asset created successfully',
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
                message: { type: 'string', example: 'Error creating asset' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asset_dto_1.CreateAssetDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all assets',
        description: 'Retrieves a list of all non-deleted assets'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Assets retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                assets: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
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
], AssetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get an asset by reference code',
        description: 'Retrieves detailed information about a specific asset'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Asset reference code', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Asset details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                asset: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Asset not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Asset not found' },
                asset: { type: 'null' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('/search/:query'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get assets by search term',
        description: 'Searches for assets by brand, model number, or serial number'
    }),
    (0, swagger_1.ApiParam)({ name: 'query', description: 'Search term (brand, model number, serial number)', type: 'string' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Search results retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                assets: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "findBySearchTerm", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get assets by user',
        description: 'Retrieves all assets assigned to a specific user'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'User reference code', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User assets retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                assets: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "assetsByUser", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an asset',
        description: 'Updates an existing asset with the provided information'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Asset reference code', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_asset_dto_1.UpdateAssetDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Asset updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Asset not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Asset not found' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating asset' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_asset_dto_1.UpdateAssetDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a deleted asset',
        description: 'Restores a previously deleted asset'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Asset reference code', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Asset restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Asset not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Asset not found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete an asset',
        description: 'Marks an asset as deleted without removing it from the database'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Asset reference code', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Asset deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Asset not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error deleting asset' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "remove", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiTags)('assets'),
    (0, common_1.Controller)('assets'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('assets'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map