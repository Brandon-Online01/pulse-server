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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
const lead_enums_1 = require("../lib/enums/lead.enums");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
let LeadsController = class LeadsController {
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    create(createLeadDto) {
        return this.leadsService.create(createLeadDto);
    }
    async findAll(page, limit, status, search, startDate, endDate) {
        const filters = {
            ...(status && { status }),
            ...(search && { search }),
            ...(startDate && endDate && {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }),
        };
        return this.leadsService.findAll(filters, page ? Number(page) : 1, limit ? Number(limit) : 25);
    }
    findOne(ref) {
        return this.leadsService.findOne(ref);
    }
    leadsByUser(ref) {
        return this.leadsService.leadsByUser(ref);
    }
    update(ref, updateLeadDto) {
        return this.leadsService.update(ref, updateLeadDto);
    }
    restore(ref) {
        return this.leadsService.restore(ref);
    }
    remove(ref) {
        return this.leadsService.remove(ref);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new lead',
        description: 'Creates a new lead with the provided details'
    }),
    (0, swagger_1.ApiBody)({ type: create_lead_dto_1.CreateLeadDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Lead created successfully',
        schema: {
            type: 'object',
            properties: {
                lead: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        company: { type: 'string' },
                        status: { type: 'string', enum: Object.values(lead_enums_1.LeadStatus) },
                        source: { type: 'string' },
                        notes: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error creating lead' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreateLeadDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all leads',
        description: 'Retrieves a paginated list of leads with optional filtering by status, search term, and date range'
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Number of records per page, defaults to 25' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: lead_enums_1.LeadStatus, required: false, description: 'Filter by lead status' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term to filter leads by name, email, or company' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: Date, required: false, description: 'Filter by start date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: Date, required: false, description: 'Filter by end date (ISO format)' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Leads retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' },
                            company: { type: 'string' },
                            status: { type: 'string', enum: Object.values(lead_enums_1.LeadStatus) },
                            source: { type: 'string' },
                            notes: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 100 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 25 },
                        totalPages: { type: 'number', example: 4 }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a lead by reference code',
        description: 'Retrieves detailed information about a specific lead'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Lead reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lead retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                lead: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        company: { type: 'string' },
                        status: { type: 'string', enum: Object.values(lead_enums_1.LeadStatus) },
                        source: { type: 'string' },
                        notes: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        assignedTo: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number' },
                                name: { type: 'string' },
                                email: { type: 'string' }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Lead not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Lead not found' },
                lead: { type: 'null' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get leads by user reference code',
        description: 'Retrieves all leads assigned to a specific user'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'User reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User leads retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                leads: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' },
                            company: { type: 'string' },
                            status: { type: 'string', enum: Object.values(lead_enums_1.LeadStatus) },
                            source: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found or has no leads',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'No leads found for this user' },
                leads: { type: 'array', items: {}, example: [] }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "leadsByUser", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a lead by reference code',
        description: 'Updates an existing lead with the provided information'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Lead reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_lead_dto_1.UpdateLeadDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lead updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Lead not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Lead not found' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating lead' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a lead by reference code',
        description: 'Restores a previously deleted lead'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Lead reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lead restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Lead not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Lead not found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a lead by reference code',
        description: 'Marks a lead as deleted without removing it from the database'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Lead reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lead deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Lead not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Lead not found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "remove", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('leads'),
    (0, common_1.Controller)('leads'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('leads'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map