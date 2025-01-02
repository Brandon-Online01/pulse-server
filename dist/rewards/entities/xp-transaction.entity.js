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
exports.XPTransaction = void 0;
const typeorm_1 = require("typeorm");
const user_rewards_entity_1 = require("./user-rewards.entity");
let XPTransaction = class XPTransaction {
};
exports.XPTransaction = XPTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], XPTransaction.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_rewards_entity_1.UserRewards, userRewards => userRewards.xpTransactions),
    __metadata("design:type", user_rewards_entity_1.UserRewards)
], XPTransaction.prototype, "userRewards", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], XPTransaction.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], XPTransaction.prototype, "xpAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], XPTransaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], XPTransaction.prototype, "timestamp", void 0);
exports.XPTransaction = XPTransaction = __decorate([
    (0, typeorm_1.Entity)('xp_transaction')
], XPTransaction);
//# sourceMappingURL=xp-transaction.entity.js.map