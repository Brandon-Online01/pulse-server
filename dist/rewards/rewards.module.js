"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rewards_service_1 = require("./rewards.service");
const rewards_controller_1 = require("./rewards.controller");
const user_rewards_entity_1 = require("./entities/user-rewards.entity");
const achievement_entity_1 = require("./entities/achievement.entity");
const xp_transaction_entity_1 = require("./entities/xp-transaction.entity");
const rewards_subscriber_1 = require("./rewards.subscriber");
const unlocked_item_entity_1 = require("./entities/unlocked-item.entity");
const licensing_module_1 = require("../licensing/licensing.module");
let RewardsModule = class RewardsModule {
};
exports.RewardsModule = RewardsModule;
exports.RewardsModule = RewardsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            licensing_module_1.LicensingModule,
            typeorm_1.TypeOrmModule.forFeature([
                user_rewards_entity_1.UserRewards,
                achievement_entity_1.Achievement,
                xp_transaction_entity_1.XPTransaction,
                unlocked_item_entity_1.UnlockedItem
            ])
        ],
        controllers: [rewards_controller_1.RewardsController],
        providers: [rewards_service_1.RewardsService, rewards_subscriber_1.RewardsSubscriber],
        exports: [rewards_service_1.RewardsService]
    })
], RewardsModule);
//# sourceMappingURL=rewards.module.js.map