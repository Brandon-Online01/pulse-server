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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const create_client_dto_1 = require("./dto/create-client.dto");
const update_client_dto_1 = require("./dto/update-client.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
const user_enums_1 = require("../lib/enums/user.enums");
const role_decorator_1 = require("../decorators/role.decorator");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
let ClientsController = class ClientsController {
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    create(createClientDto) {
        return this.clientsService.create(createClientDto);
    }
    findAll(page, limit) {
        return this.clientsService.findAll(page ? Number(page) : 1, limit ? Number(limit) : Number(process.env.DEFAULT_PAGE_LIMIT));
    }
    findOne(ref) {
        return this.clientsService.findOne(ref);
    }
    update(ref, updateClientDto) {
        return this.clientsService.update(ref, updateClientDto);
    }
    restore(ref) {
        return this.clientsService.restore(ref);
    }
    remove(ref) {
        return this.clientsService.remove(ref);
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new client',
        description: 'Creates a new client with the provided details including contact information and address',
    }),
    (0, swagger_1.ApiBody)({ type: create_client_dto_1.CreateClientDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Client created successfully',
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
                message: { type: 'string', example: 'Error creating client' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CreateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all clients',
        description: 'Retrieves a paginated list of all clients with optional filtering',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Number of records per page, defaults to system setting',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of clients retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 100 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 10 },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a client by reference code',
        description: 'Retrieves detailed information about a specific client',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Client reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Client details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                client: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Client not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Client not found' },
                client: { type: 'null' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a client',
        description: 'Updates an existing client with the provided information',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Client reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_client_dto_1.UpdateClientDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Client updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Client not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Client not found' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating client' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_client_dto_1.UpdateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a deleted client',
        description: 'Restores a previously deleted client',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Client reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Client restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Client not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Client not found' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a client',
        description: 'Marks a client as deleted without removing it from the database',
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Client reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Client deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Client not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error deleting client' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "remove", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)('clients'),
    (0, common_1.Controller)('clients'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('clients'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map