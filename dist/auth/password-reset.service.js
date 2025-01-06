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
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const password_reset_entity_1 = require("./entities/password-reset.entity");
let PasswordResetService = class PasswordResetService {
    constructor(passwordResetRepository) {
        this.passwordResetRepository = passwordResetRepository;
    }
    async create(email, resetToken) {
        const passwordReset = this.passwordResetRepository.create({
            email,
            resetToken,
            tokenExpires: new Date(Date.now() + 30 * 60 * 1000),
        });
        return this.passwordResetRepository.save(passwordReset);
    }
    async findByEmail(email) {
        return this.passwordResetRepository.findOne({
            where: { email, isUsed: false },
            order: { createdAt: 'DESC' }
        });
    }
    async findByToken(token) {
        return this.passwordResetRepository.findOne({
            where: { resetToken: token, isUsed: false }
        });
    }
    async markAsUsed(uid) {
        await this.passwordResetRepository.update(uid, { isUsed: true });
    }
    async delete(uid) {
        await this.passwordResetRepository.delete(uid);
    }
    async cleanupExpired() {
        await this.passwordResetRepository.delete({
            tokenExpires: new Date(),
            isUsed: false
        });
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(password_reset_entity_1.PasswordReset)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PasswordResetService);
//# sourceMappingURL=password-reset.service.js.map