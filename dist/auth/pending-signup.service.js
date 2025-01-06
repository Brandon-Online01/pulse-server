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
exports.PendingSignupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pending_signup_entity_1 = require("./entities/pending-signup.entity");
let PendingSignupService = class PendingSignupService {
    constructor(pendingSignupRepository) {
        this.pendingSignupRepository = pendingSignupRepository;
    }
    async create(email, verificationToken) {
        const pendingSignup = this.pendingSignupRepository.create({
            email,
            verificationToken,
            tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        return this.pendingSignupRepository.save(pendingSignup);
    }
    async findByEmail(email) {
        return this.pendingSignupRepository.findOne({ where: { email } });
    }
    async findByToken(token) {
        return this.pendingSignupRepository.findOne({ where: { verificationToken: token } });
    }
    async markAsVerified(id) {
        await this.pendingSignupRepository.update(id, { isVerified: true });
    }
    async delete(id) {
        await this.pendingSignupRepository.delete(id);
    }
    async cleanupExpired() {
        await this.pendingSignupRepository.delete({
            tokenExpires: new Date(),
            isVerified: false
        });
    }
};
exports.PendingSignupService = PendingSignupService;
exports.PendingSignupService = PendingSignupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pending_signup_entity_1.PendingSignup)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PendingSignupService);
//# sourceMappingURL=pending-signup.service.js.map