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
exports.UpdateProductDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_product_dto_1 = require("./create-product.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateProductDto extends (0, swagger_1.PartialType)(create_product_dto_1.CreateProductDto) {
}
exports.UpdateProductDto = UpdateProductDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The name of the product',
        example: 'Product Name'
    }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The description of the product',
        example: 'Product Description'
    }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The image of the product',
        example: 'https://example.com/image.jpg'
    }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "image", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The price of the product',
        example: 10.99
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The sale price of the product',
        example: 9.99
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "salePrice", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The discount of the product',
        example: 10
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "discount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The barcode of the product',
        example: 1234567890
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "barcode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The package quantity of the product',
        example: 10
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "packageQuantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The category of the product',
        example: 'Dairy'
    }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The weight of the product',
        example: 100
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The status of the product',
        example: { uid: 1 }
    }),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "reseller", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_2.ApiProperty)({
        description: 'The isOnPromotion of the product',
        example: true
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isOnPromotion", void 0);
//# sourceMappingURL=update-product.dto.js.map