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
exports.CreateNewsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const news_enums_1 = require("../../lib/enums/news.enums");
const class_validator_1 = require("class-validator");
class CreateNewsDto {
}
exports.CreateNewsDto = CreateNewsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'News Title',
        description: 'The title of the news'
    }),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'News Subtitle',
        description: 'The subtitle of the news'
    }),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "subtitle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'News Content',
        description: 'The content of the news'
    }),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/attachments.pdf',
        description: 'The attachments of the news'
    }),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/cover.png',
        description: 'The cover image of the news'
    }),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "coverImage", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/thumbnail.png',
        description: 'The thumbnail of the news'
    }),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "thumbnail", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: new Date(),
        description: 'The publishing date of the news'
    }),
    __metadata("design:type", Date)
], CreateNewsDto.prototype, "publishingDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The author reference code of the news'
    }),
    __metadata("design:type", Object)
], CreateNewsDto.prototype, "author", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The branch reference code of the news'
    }),
    __metadata("design:type", Object)
], CreateNewsDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Deletetion status of the news'
    }),
    __metadata("design:type", Boolean)
], CreateNewsDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(news_enums_1.NewsCategory),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: news_enums_1.NewsCategory.NEWS,
        description: 'The category of the news'
    }),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "category", void 0);
//# sourceMappingURL=create-news.dto.js.map