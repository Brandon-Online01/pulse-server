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
exports.DocsController = void 0;
const docs_service_1 = require("./docs.service");
const create_doc_dto_1 = require("./dto/create-doc.dto");
const update_doc_dto_1 = require("./dto/update-doc.dto");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const public_decorator_1 = require("../decorators/public.decorator");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
let DocsController = class DocsController {
    constructor(docsService) {
        this.docsService = docsService;
    }
    create(createDocDto) {
        return this.docsService.create(createDocDto);
    }
    async uploadFile(file, type, req) {
        try {
            const ownerId = req.user?.uid;
            const branchId = req.user?.branch?.uid;
            const result = await this.docsService.uploadFile(file, type, ownerId, branchId);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException({
                message: error.message,
                error: 'File Upload Failed',
                statusCode: 400,
            });
        }
    }
    async deleteFromBucket(ref) {
        return this.docsService.deleteFromBucket(ref);
    }
    async getExtension(filename) {
        const parts = filename?.split('.');
        return parts?.length === 1 ? '' : parts[parts?.length - 1];
    }
    findAll() {
        return this.docsService.findAll();
    }
    findByUser(ref) {
        return this.docsService.docsByUser(ref);
    }
    findOne(ref) {
        return this.docsService.findOne(ref);
    }
    update(ref, updateDocDto) {
        return this.docsService.update(ref, updateDocDto);
    }
    async getDownloadUrl(ref) {
        return this.docsService.getDownloadUrl(ref);
    }
};
exports.DocsController = DocsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({ summary: 'create a new document' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_doc_dto_1.CreateDocDto]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/i }),
        ],
        errorHttpStatusCode: 400,
    }))),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('/remove/:ref'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({ summary: 'soft delete an file from a storage bucket in google cloud storage' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DocsController.prototype, "deleteFromBucket", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({ summary: 'get all documents' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({ summary: 'get documents by user reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({ summary: 'get a document by reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({ summary: 'update a document by reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_doc_dto_1.UpdateDocDto]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('download/:ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.TECHNICIAN),
    (0, swagger_1.ApiOperation)({ summary: 'get download URL for a document' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DocsController.prototype, "getDownloadUrl", null);
exports.DocsController = DocsController = __decorate([
    (0, swagger_1.ApiTags)('docs'),
    (0, common_1.Controller)('docs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('claims'),
    __metadata("design:paramtypes", [docs_service_1.DocsService])
], DocsController);
//# sourceMappingURL=docs.controller.js.map