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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDocDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDocDto {
}
exports.CreateDocDto = CreateDocDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Title of the document',
        example: 'Document Title'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Content of the document',
        example: 'Document Content'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Description of the document',
        example: 'Document Description'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'File type of the document',
        example: 'pdf'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "fileType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'File size of the document',
        example: 1024
    }),
    __metadata("design:type", Number)
], CreateDocDto.prototype, "fileSize", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'URL of the document',
        example: 'https://example.com/document.pdf'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Thumbnail URL of the document',
        example: 'https://example.com/thumbnail.jpg'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'Metadata of the document',
        example: { key: 'value' }
    }),
    __metadata("design:type", Object)
], CreateDocDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: 'Is public of the document',
        example: true
    }),
    __metadata("design:type", Boolean)
], CreateDocDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Mime type of the document',
        example: 'application/pdf'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Extension of the document',
        example: '.pdf'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "extension", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'Owner of the document',
        example: { uid: 1 }
    }),
    __metadata("design:type", Object)
], CreateDocDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, swagger_1.ApiProperty)({
        description: 'Shared with of the document',
        example: ['user_uid']
    }),
    __metadata("design:type", Array)
], CreateDocDto.prototype, "sharedWith", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Version of the document',
        example: 1
    }),
    __metadata("design:type", Number)
], CreateDocDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: 'Is deleted of the document',
        example: false
    }),
    __metadata("design:type", Boolean)
], CreateDocDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        description: 'Created at of the document',
        example: new Date()
    }),
    __metadata("design:type", Date)
], CreateDocDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        description: 'Updated at of the document',
        example: new Date()
    }),
    __metadata("design:type", Date)
], CreateDocDto.prototype, "updatedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, swagger_1.ApiProperty)({
        description: 'Last accessed at of the document',
        example: new Date()
    }),
    __metadata("design:type", Date)
], CreateDocDto.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'Created by of the document',
        example: { uid: 1 }
    }),
    __metadata("design:type", Object)
], CreateDocDto.prototype, "createdBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'Updated by of the document',
        example: { uid: 1 }
    }),
    __metadata("design:type", Object)
], CreateDocDto.prototype, "updatedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'File URL of the document',
        example: 'https://example.com/document.pdf'
    }),
    __metadata("design:type", String)
], CreateDocDto.prototype, "fileUrl", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The branch reference code of the document'
    }),
    __metadata("design:type", Object)
], CreateDocDto.prototype, "branch", void 0);
//# sourceMappingURL=create-doc.dto.js.map