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
exports.JournalController = void 0;
const journal_service_1 = require("./journal.service");
const create_journal_dto_1 = require("./dto/create-journal.dto");
const swagger_1 = require("@nestjs/swagger");
const role_guard_1 = require("../guards/role.guard");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const update_journal_dto_1 = require("./dto/update-journal.dto");
const auth_guard_1 = require("../guards/auth.guard");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
const common_1 = require("@nestjs/common");
let JournalController = class JournalController {
    constructor(journalService) {
        this.journalService = journalService;
    }
    create(createJournalDto) {
        return this.journalService.create(createJournalDto);
    }
    findAll() {
        return this.journalService.findAll();
    }
    findOne(ref) {
        return this.journalService.findOne(ref);
    }
    journalsByUser(ref) {
        return this.journalService.journalsByUser(ref);
    }
    update(ref, updateJournalDto) {
        return this.journalService.update(ref, updateJournalDto);
    }
    restore(ref) {
        return this.journalService.restore(ref);
    }
    remove(ref) {
        return this.journalService.remove(ref);
    }
};
exports.JournalController = JournalController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new journal entry',
        description: 'Creates a new journal entry with the provided data. Requires ADMIN, MANAGER, or SUPPORT role.'
    }),
    (0, swagger_1.ApiBody)({ type: create_journal_dto_1.CreateJournalDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Journal entry created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_journal_dto_1.CreateJournalDto]),
    __metadata("design:returntype", void 0)
], JournalController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all journal entries',
        description: 'Retrieves all journal entries. Requires ADMIN, MANAGER, or SUPPORT role.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of all journal entries',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            clientRef: { type: 'string', example: 'CLT123456' },
                            fileURL: { type: 'string', example: 'https://storage.example.com/journals/file123.pdf' },
                            comments: { type: 'string', example: 'This is a comment' },
                            timestamp: { type: 'string', format: 'date-time' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                            isDeleted: { type: 'boolean', example: false },
                            owner: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 }
                                }
                            },
                            branch: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 }
                                }
                            }
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
], JournalController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a journal entry by reference code',
        description: 'Retrieves a specific journal entry by its reference code. Requires ADMIN, MANAGER, or SUPPORT role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Journal reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Journal entry found',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        clientRef: { type: 'string', example: 'CLT123456' },
                        fileURL: { type: 'string', example: 'https://storage.example.com/journals/file123.pdf' },
                        comments: { type: 'string', example: 'This is a comment' },
                        timestamp: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        isDeleted: { type: 'boolean', example: false },
                        owner: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number', example: 1 }
                            }
                        },
                        branch: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number', example: 1 }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Journal entry not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], JournalController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get journals by user reference code',
        description: 'Retrieves all journal entries associated with a specific user. Accessible by all authenticated users.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'User reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of journal entries for the specified user',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            clientRef: { type: 'string', example: 'CLT123456' },
                            fileURL: { type: 'string', example: 'https://storage.example.com/journals/file123.pdf' },
                            comments: { type: 'string', example: 'This is a comment' },
                            timestamp: { type: 'string', format: 'date-time' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                            isDeleted: { type: 'boolean', example: false },
                            owner: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 }
                                }
                            },
                            branch: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 }
                                }
                            }
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
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found or has no journal entries' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], JournalController.prototype, "journalsByUser", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a journal entry by reference code',
        description: 'Updates a specific journal entry by its reference code. Requires ADMIN, MANAGER, or SUPPORT role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Journal reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiBody)({ type: update_journal_dto_1.UpdateJournalDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Journal entry updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Journal entry not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_journal_dto_1.UpdateJournalDto]),
    __metadata("design:returntype", void 0)
], JournalController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a journal entry by reference code',
        description: 'Restores a previously deleted journal entry. Requires ADMIN, MANAGER, or SUPPORT role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Journal reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Journal entry restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Journal entry not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], JournalController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a journal entry by reference code',
        description: 'Performs a soft delete on a journal entry. Requires ADMIN, MANAGER, or SUPPORT role.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Journal reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Journal entry deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Journal entry not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], JournalController.prototype, "remove", null);
exports.JournalController = JournalController = __decorate([
    (0, swagger_1.ApiTags)('journal'),
    (0, common_1.Controller)('journal'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('journal'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized access due to invalid credentials or missing token' }),
    __metadata("design:paramtypes", [journal_service_1.JournalService])
], JournalController);
//# sourceMappingURL=journal.controller.js.map