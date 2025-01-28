"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const claims_service_1 = require("./claims.service");
const claims_controller_1 = require("./claims.controller");
const claim_entity_1 = require("./entities/claim.entity");
const currency_service_1 = require("./utils/currency.service");
const stats_service_1 = require("./utils/stats.service");
const config_1 = require("@nestjs/config");
const rewards_module_1 = require("../rewards/rewards.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const licensing_module_1 = require("../licensing/licensing.module");
let ClaimsModule = class ClaimsModule {
};
exports.ClaimsModule = ClaimsModule;
exports.ClaimsModule = ClaimsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([claim_entity_1.Claim]),
            config_1.ConfigModule,
            rewards_module_1.RewardsModule,
            licensing_module_1.LicensingModule,
            event_emitter_1.EventEmitterModule,
        ],
        controllers: [claims_controller_1.ClaimsController],
        providers: [
            claims_service_1.ClaimsService,
            currency_service_1.CurrencyService,
            stats_service_1.ClaimStatsService,
        ],
        exports: [claims_service_1.ClaimsService],
    })
], ClaimsModule);
//# sourceMappingURL=claims.module.js.map