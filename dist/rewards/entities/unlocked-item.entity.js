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
exports.UnlockedItem = void 0;
const typeorm_1 = require("typeorm");
const user_rewards_entity_1 = require("./user-rewards.entity");
const rewards_enum_1 = require("../../lib/enums/rewards.enum");
const rewards_enum_2 = require("../../lib/enums/rewards.enum");
let UnlockedItem = class UnlockedItem {
};
exports.UnlockedItem = UnlockedItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UnlockedItem.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UnlockedItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UnlockedItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: rewards_enum_2.ItemType
    }),
    __metadata("design:type", String)
], UnlockedItem.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: rewards_enum_1.ItemRarity,
        default: rewards_enum_1.ItemRarity.COMMON
    }),
    __metadata("design:type", String)
], UnlockedItem.prototype, "rarity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UnlockedItem.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UnlockedItem.prototype, "requiredLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UnlockedItem.prototype, "requiredXP", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_rewards_entity_1.UserRewards, userRewards => userRewards.inventory),
    __metadata("design:type", user_rewards_entity_1.UserRewards)
], UnlockedItem.prototype, "userRewards", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UnlockedItem.prototype, "unlockedAt", void 0);
exports.UnlockedItem = UnlockedItem = __decorate([
    (0, typeorm_1.Entity)('unlocked_item')
], UnlockedItem);
//# sourceMappingURL=unlocked-item.entity.js.map