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
const path_1 = require("path");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const role_guard_1 = require("../guards/role.guard");
const auth_guard_1 = require("../guards/auth.guard");
let DocsController = class DocsController {
    constructor(docsService) {
        this.docsService = docsService;
    }
    create(createDocDto) {
        return this.docsService.create(createDocDto);
    }
    async uploadToBucket(file) {
        return this.docsService.uploadToBucket(file);
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
    findOne(ref) {
        return this.docsService.findOne(ref);
    }
    docsByUser(ref) {
        return this.docsService.docsByUser(ref);
    }
    update(ref, updateDocDto) {
        return this.docsService.update(ref, updateDocDto);
    }
    remove(ref) {
        return this.docsService.remove(ref);
    }
};
exports.DocsController = DocsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'create a new document' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_doc_dto_1.CreateDocDto]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('/upload'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({ summary: 'upload an file to a storage bucket in google cloud storage' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        fileFilter: (req, file, cb) => {
            if (!file.originalname) {
                return cb(new common_1.NotFoundException('No file name provided'), false);
            }
            const allowedExtensions = ['.png', '.jpg', '.jpeg', 'webp', '.gif', 'mp4'];
            const ext = (0, path_1.extname)(file?.originalname)?.toLowerCase();
            if (!allowedExtensions?.includes(ext)) {
                return cb(new common_1.BadRequestException('Invalid file type. Only PNG, JPG, GIF, MP4, and JPEG files are allowed.'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocsController.prototype, "uploadToBucket", null);
__decorate([
    (0, common_1.Post)('/remove/:ref'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({ summary: 'soft delete an file from a storage bucket in google cloud storage' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocsController.prototype, "deleteFromBucket", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get all documents' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get a document by reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'get documents by user reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "docsByUser", null);
__decorate([
    (0, common_1.Patch)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'update a document by reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_doc_dto_1.UpdateDocDto]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({ summary: 'soft delete a document by reference code' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "remove", null);
exports.DocsController = DocsController = __decorate([
    (0, swagger_1.ApiTags)('docs'),
    (0, common_1.Controller)('docs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    __metadata("design:paramtypes", [docs_service_1.DocsService])
], DocsController);
//# sourceMappingURL=docs.controller.js.map