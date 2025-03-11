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
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const role_guard_1 = require("../guards/role.guard");
const user_enums_1 = require("../lib/enums/user.enums");
const auth_guard_1 = require("../guards/auth.guard");
const role_decorator_1 = require("../decorators/role.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const status_enums_1 = require("../lib/enums/status.enums");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    findAll(page, limit, status, accessLevel, search, branchId, organisationId) {
        const filters = {
            ...(status && { status }),
            ...(accessLevel && { accessLevel }),
            ...(search && { search }),
            ...(branchId && { branchId: Number(branchId) }),
            ...(organisationId && { organisationId: Number(organisationId) }),
        };
        return this.userService.findAll(filters, page ? Number(page) : 1, limit ? Number(limit) : Number(process.env.DEFAULT_PAGE_LIMIT));
    }
    findOne(searchParameter) {
        return this.userService.findOne(searchParameter);
    }
    update(ref, updateUserDto) {
        return this.userService.update(ref, updateUserDto);
    }
    restore(ref) {
        return this.userService.restore(ref);
    }
    remove(ref) {
        return this.userService.remove(ref);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new user',
        description: 'Creates a new user with the provided data. Accessible by users with appropriate roles.',
    }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        username: { type: 'string', example: 'brandon123' },
                        name: { type: 'string', example: 'Brandon' },
                        surname: { type: 'string', example: 'Nkawu' },
                        email: { type: 'string', example: 'brandon@loro.co.za' },
                        phone: { type: 'string', example: '+27 64 123 4567' },
                        photoURL: { type: 'string', example: 'https://example.com/photo.jpg' },
                        accessLevel: { type: 'string', enum: Object.values(user_enums_1.AccessLevel), example: user_enums_1.AccessLevel.USER },
                        status: { type: 'string', enum: Object.values(status_enums_1.AccountStatus), example: status_enums_1.AccountStatus.ACTIVE },
                        userref: { type: 'string', example: 'USR123456' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users',
        description: 'Retrieves all users with optional filtering and pagination. Requires ADMIN or MANAGER role.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Page number for pagination', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Number of items per page', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'status', description: 'Filter by account status', required: false, enum: status_enums_1.AccountStatus }),
    (0, swagger_1.ApiQuery)({ name: 'accessLevel', description: 'Filter by access level', required: false, enum: user_enums_1.AccessLevel }),
    (0, swagger_1.ApiQuery)({ name: 'search', description: 'Search term for filtering users', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'branchId', description: 'Filter by branch ID', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'organisationId', description: 'Filter by organisation ID', required: false, type: Number }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of users with pagination',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            username: { type: 'string', example: 'brandon123' },
                            name: { type: 'string', example: 'Brandon' },
                            surname: { type: 'string', example: 'Nkawu' },
                            email: { type: 'string', example: 'brandon@loro.co.za' },
                            phone: { type: 'string', example: '+27 64 123 4567' },
                            photoURL: { type: 'string', example: 'https://example.com/photo.jpg' },
                            accessLevel: {
                                type: 'string',
                                enum: Object.values(user_enums_1.AccessLevel),
                                example: user_enums_1.AccessLevel.USER,
                            },
                            status: {
                                type: 'string',
                                enum: Object.values(status_enums_1.AccountStatus),
                                example: status_enums_1.AccountStatus.ACTIVE,
                            },
                            userref: { type: 'string', example: 'USR123456' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                            profile: {
                                type: 'object',
                                properties: {
                                    height: { type: 'string', example: '180cm' },
                                    weight: { type: 'string', example: '75kg' },
                                    gender: { type: 'string', example: 'MALE' },
                                },
                            },
                            employmentProfile: {
                                type: 'object',
                                properties: {
                                    position: { type: 'string', example: 'Senior Software Engineer' },
                                    department: { type: 'string', example: 'ENGINEERING' },
                                },
                            },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 50 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 5 },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('accessLevel')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('branchId')),
    __param(6, (0, common_1.Query)('organisationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a user by search parameter',
        description: 'Retrieves a user by email, phone number, or reference code. Accessible by all authenticated users.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'searchParameter',
        description: 'User identifier (email, phone, or reference code)',
        type: 'string',
        example: 'USR123456',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User found',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        username: { type: 'string', example: 'brandon123' },
                        name: { type: 'string', example: 'Brandon' },
                        surname: { type: 'string', example: 'Nkawu' },
                        email: { type: 'string', example: 'brandon@loro.co.za' },
                        phone: { type: 'string', example: '+27 64 123 4567' },
                        photoURL: { type: 'string', example: 'https://example.com/photo.jpg' },
                        accessLevel: { type: 'string', enum: Object.values(user_enums_1.AccessLevel), example: user_enums_1.AccessLevel.USER },
                        status: { type: 'string', enum: Object.values(status_enums_1.AccountStatus), example: status_enums_1.AccountStatus.ACTIVE },
                        userref: { type: 'string', example: 'USR123456' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        profile: {
                            type: 'object',
                            properties: {
                                height: { type: 'string', example: '180cm' },
                                weight: { type: 'string', example: '75kg' },
                                gender: { type: 'string', example: 'MALE' },
                            },
                        },
                        employmentProfile: {
                            type: 'object',
                            properties: {
                                position: { type: 'string', example: 'Senior Software Engineer' },
                                department: { type: 'string', example: 'ENGINEERING' },
                            },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    __param(0, (0, common_1.Param)('searchParameter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a user by reference code',
        description: 'Updates a user by reference code. Accessible by users with appropriate roles.',
    }),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Reference code',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('restore/:ref'),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a deleted user by reference code',
        description: 'Restores a previously deleted user. Accessible by users with appropriate roles.',
    }),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'User reference code',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a user by reference code',
        description: 'Performs a soft delete on a user. Accessible by users with appropriate roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'User reference code',
        type: 'string',
        example: 'USR123456',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('user'),
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized access due to invalid credentials or missing token' }),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map