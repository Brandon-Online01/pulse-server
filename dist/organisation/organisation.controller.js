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
exports.OrganisationController = void 0;
const common_1 = require("@nestjs/common");
const organisation_service_1 = require("./organisation.service");
const create_organisation_dto_1 = require("./dto/create-organisation.dto");
const update_organisation_dto_1 = require("./dto/update-organisation.dto");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
let OrganisationController = class OrganisationController {
    constructor(organisationService) {
        this.organisationService = organisationService;
    }
    create(createOrganisationDto) {
        return this.organisationService.create(createOrganisationDto);
    }
    findAll() {
        return this.organisationService.findAll();
    }
    findOne(ref) {
        return this.organisationService.findOne(ref);
    }
    update(ref, updateOrganisationDto) {
        return this.organisationService.update(ref, updateOrganisationDto);
    }
    restore(ref) {
        return this.organisationService.restore(ref);
    }
    remove(ref) {
        return this.organisationService.remove(ref);
    }
};
exports.OrganisationController = OrganisationController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new organisation',
        description: 'Creates a new organisation with the provided data. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
    }),
    (0, swagger_1.ApiBody)({ type: create_organisation_dto_1.CreateOrganisationDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Organisation created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Acme Inc.' },
                        email: { type: 'string', example: 'brandon@loro.co.za' },
                        phone: { type: 'string', example: '123-456-7890' },
                        contactPerson: { type: 'string', example: 'Brandon Nkawu' },
                        website: { type: 'string', example: 'https://www.acme.com' },
                        logo: { type: 'string', example: 'https://www.acme.com/logo.png' },
                        orgref: { type: 'string', example: 'ORG123456' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        isDeleted: { type: 'boolean', example: false },
                        address: {
                            type: 'object',
                            properties: {
                                street: { type: 'string', example: '123 Main St' },
                                city: { type: 'string', example: 'Cape Town' },
                                state: { type: 'string', example: 'Western Cape' },
                                postalCode: { type: 'string', example: '8001' },
                                country: { type: 'string', example: 'South Africa' },
                                latitude: { type: 'number', example: -33.9249 },
                                longitude: { type: 'number', example: 18.4241 }
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
    __metadata("design:paramtypes", [create_organisation_dto_1.CreateOrganisationDto]),
    __metadata("design:returntype", void 0)
], OrganisationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all organisations',
        description: 'Retrieves all organisations. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of all organisations',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            name: { type: 'string', example: 'Acme Inc.' },
                            email: { type: 'string', example: 'brandon@loro.co.za' },
                            phone: { type: 'string', example: '123-456-7890' },
                            contactPerson: { type: 'string', example: 'Brandon Nkawu' },
                            website: { type: 'string', example: 'https://www.acme.com' },
                            logo: { type: 'string', example: 'https://www.acme.com/logo.png' },
                            orgref: { type: 'string', example: 'ORG123456' },
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
], OrganisationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get an organisation by reference code',
        description: 'Retrieves a specific organisation by its reference code. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Organisation reference code',
        type: 'string',
        example: 'ORG123456'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Organisation found',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Acme Inc.' },
                        email: { type: 'string', example: 'brandon@loro.co.za' },
                        phone: { type: 'string', example: '123-456-7890' },
                        contactPerson: { type: 'string', example: 'Brandon Nkawu' },
                        website: { type: 'string', example: 'https://www.acme.com' },
                        logo: { type: 'string', example: 'https://www.acme.com/logo.png' },
                        orgref: { type: 'string', example: 'ORG123456' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        isDeleted: { type: 'boolean', example: false },
                        address: {
                            type: 'object',
                            properties: {
                                street: { type: 'string', example: '123 Main St' },
                                city: { type: 'string', example: 'Cape Town' },
                                state: { type: 'string', example: 'Western Cape' },
                                postalCode: { type: 'string', example: '8001' },
                                country: { type: 'string', example: 'South Africa' },
                                latitude: { type: 'number', example: -33.9249 },
                                longitude: { type: 'number', example: 18.4241 }
                            }
                        },
                        branches: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 },
                                    name: { type: 'string', example: 'Main Branch' }
                                }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Organisation not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganisationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an organisation by reference code',
        description: 'Updates a specific organisation by its reference code. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Organisation reference code',
        type: 'string',
        example: 'ORG123456'
    }),
    (0, swagger_1.ApiBody)({ type: update_organisation_dto_1.UpdateOrganisationDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Organisation updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Organisation not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_organisation_dto_1.UpdateOrganisationDto]),
    __metadata("design:returntype", void 0)
], OrganisationController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a deleted organisation by reference code',
        description: 'Restores a previously deleted organisation. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Organisation reference code',
        type: 'string',
        example: 'ORG123456'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Organisation restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Organisation not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganisationController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete an organisation by reference code',
        description: 'Performs a soft delete on an organisation. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Organisation reference code',
        type: 'string',
        example: 'ORG123456'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Organisation deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Organisation not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganisationController.prototype, "remove", null);
exports.OrganisationController = OrganisationController = __decorate([
    (0, swagger_1.ApiTags)('org'),
    (0, common_1.Controller)('org'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized access due to invalid credentials or missing token' }),
    __metadata("design:paramtypes", [organisation_service_1.OrganisationService])
], OrganisationController);
//# sourceMappingURL=organisation.controller.js.map