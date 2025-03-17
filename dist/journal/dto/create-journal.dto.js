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
exports.CreateJournalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const journal_enums_1 = require("../../lib/enums/journal.enums");
class CreateJournalDto {
}
exports.CreateJournalDto = CreateJournalDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Client reference number',
        example: 'CLT123456',
    }),
    __metadata("design:type", String)
], CreateJournalDto.prototype, "clientRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'URL to the journal file',
        example: 'https://storage.example.com/journals/file123.pdf',
    }),
    __metadata("design:type", String)
], CreateJournalDto.prototype, "fileURL", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        description: 'The owner reference code of the journal',
        example: { uid: 1 },
    }),
    __metadata("design:type", Object)
], CreateJournalDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    (0, swagger_1.ApiProperty)({
        example: { uid: 1 },
        description: 'The branch reference code of the journal'
    }),
    __metadata("design:type", Object)
], CreateJournalDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'The comments of the journal',
        example: 'This is a comment',
    }),
    __metadata("design:type", String)
], CreateJournalDto.prototype, "comments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(journal_enums_1.JournalStatus),
    (0, swagger_1.ApiProperty)({
        description: 'Journal status',
        enum: journal_enums_1.JournalStatus,
        default: journal_enums_1.JournalStatus.PENDING_REVIEW,
        example: journal_enums_1.JournalStatus.PENDING_REVIEW
    }),
    __metadata("design:type", String)
], CreateJournalDto.prototype, "status", void 0);
//# sourceMappingURL=create-journal.dto.js.map