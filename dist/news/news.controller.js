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
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const news_service_1 = require("./news.service");
const create_news_dto_1 = require("./dto/create-news.dto");
const update_news_dto_1 = require("./dto/update-news.dto");
const swagger_1 = require("@nestjs/swagger");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const user_enums_1 = require("../lib/enums/user.enums");
const role_decorator_1 = require("../decorators/role.decorator");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
let NewsController = class NewsController {
    constructor(newsService) {
        this.newsService = newsService;
    }
    create(createNewsDto) {
        return this.newsService.create(createNewsDto);
    }
    findAll() {
        return this.newsService.findAll();
    }
    findOne(ref) {
        return this.newsService.findOne(ref);
    }
    update(ref, updateNewsDto) {
        return this.newsService.update(ref, updateNewsDto);
    }
    remove(ref) {
        return this.newsService.remove(ref);
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Post)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new article',
        description: 'Creates a new news article with the provided details'
    }),
    (0, swagger_1.ApiBody)({ type: create_news_dto_1.CreateNewsDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Article created successfully',
        schema: {
            type: 'object',
            properties: {
                article: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        author: { type: 'string' },
                        imageUrl: { type: 'string' },
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
                message: { type: 'string', example: 'Error creating article' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_news_dto_1.CreateNewsDto]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all articles',
        description: 'Retrieves a list of all news articles'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Articles retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                articles: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number' },
                            title: { type: 'string' },
                            content: { type: 'string' },
                            author: { type: 'string' },
                            imageUrl: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
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
], NewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get an article by reference code',
        description: 'Retrieves detailed information about a specific news article'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Article reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Article retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                article: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        author: { type: 'string' },
                        imageUrl: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Article not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Article not found' },
                article: { type: 'null' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an article by reference code',
        description: 'Updates an existing news article with the provided information'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Article reference code or ID', type: 'number' }),
    (0, swagger_1.ApiBody)({ type: update_news_dto_1.UpdateNewsDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Article updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Article not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Article not found' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad Request - Invalid data provided',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Error updating article' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_news_dto_1.UpdateNewsDto]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete an article by reference code',
        description: 'Marks a news article as deleted without removing it from the database'
    }),
    (0, swagger_1.ApiParam)({ name: 'ref', description: 'Article reference code or ID', type: 'number' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Article deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Article not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Article not found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NewsController.prototype, "remove", null);
exports.NewsController = NewsController = __decorate([
    (0, swagger_1.ApiTags)('news'),
    (0, common_1.Controller)('news'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('news'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized - Invalid credentials or missing token' }),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsController);
//# sourceMappingURL=news.controller.js.map