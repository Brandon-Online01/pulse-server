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
exports.UserRewards = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const achievement_entity_1 = require("./achievement.entity");
const unlocked_item_entity_1 = require("./unlocked-item.entity");
const xp_transaction_entity_1 = require("./xp-transaction.entity");
let UserRewards = class UserRewards {
};
exports.UserRewards = UserRewards;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserRewards.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user?.rewards),
    __metadata("design:type", user_entity_1.User)
], UserRewards.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserRewards.prototype, "currentXP", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserRewards.prototype, "totalXP", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], UserRewards.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ROOKIE' }),
    __metadata("design:type", String)
], UserRewards.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => achievement_entity_1.Achievement, achievement => achievement.userRewards),
    __metadata("design:type", Array)
], UserRewards.prototype, "achievements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => unlocked_item_entity_1.UnlockedItem, item => item.userRewards),
    __metadata("design:type", Array)
], UserRewards.prototype, "inventory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => xp_transaction_entity_1.XPTransaction, transaction => transaction.userRewards),
    __metadata("design:type", Array)
], UserRewards.prototype, "xpTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], UserRewards.prototype, "xpBreakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserRewards.prototype, "lastAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserRewards.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserRewards.prototype, "updatedAt", void 0);
exports.UserRewards = UserRewards = __decorate([
    (0, typeorm_1.Entity)()
], UserRewards);
//# sourceMappingURL=user-rewards.entity.js.map