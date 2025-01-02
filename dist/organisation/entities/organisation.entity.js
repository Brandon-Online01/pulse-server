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
exports.Organisation = void 0;
const status_enums_1 = require("../../lib/enums/status.enums");
const branch_entity_1 = require("../../branch/entities/branch.entity");
const typeorm_1 = require("typeorm");
let Organisation = class Organisation {
};
exports.Organisation = Organisation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Organisation.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Organisation.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Organisation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Organisation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: status_enums_1.GeneralStatus.ACTIVE }),
    __metadata("design:type", String)
], Organisation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: false }),
    __metadata("design:type", Boolean)
], Organisation.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Organisation.prototype, "ref", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => branch_entity_1.Branch, (branch) => branch.ref),
    __metadata("design:type", Array)
], Organisation.prototype, "branches", void 0);
exports.Organisation = Organisation = __decorate([
    (0, typeorm_1.Entity)('organisation')
], Organisation);
//# sourceMappingURL=organisation.entity.js.map