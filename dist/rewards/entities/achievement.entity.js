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
exports.Achievement = void 0;
const typeorm_1 = require("typeorm");
const user_rewards_entity_1 = require("./user-rewards.entity");
const rewards_enum_1 = require("../../lib/enums/rewards.enum");
let Achievement = class Achievement {
};
exports.Achievement = Achievement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Achievement.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Achievement.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Achievement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Achievement.prototype, "xpValue", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Achievement.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], Achievement.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: rewards_enum_1.AchievementCategory,
        default: rewards_enum_1.AchievementCategory.SPECIAL
    }),
    __metadata("design:type", String)
], Achievement.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Achievement.prototype, "isRepeatable", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_rewards_entity_1.UserRewards, userRewards => userRewards.achievements),
    __metadata("design:type", user_rewards_entity_1.UserRewards)
], Achievement.prototype, "userRewards", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Achievement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Achievement.prototype, "updatedAt", void 0);
exports.Achievement = Achievement = __decorate([
    (0, typeorm_1.Entity)('achievement')
], Achievement);
//# sourceMappingURL=achievement.entity.js.map