"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResellersModule = void 0;
const common_1 = require("@nestjs/common");
const resellers_service_1 = require("./resellers.service");
const resellers_controller_1 = require("./resellers.controller");
const typeorm_1 = require("@nestjs/typeorm");
const reseller_entity_1 = require("./entities/reseller.entity");
let ResellersModule = class ResellersModule {
};
exports.ResellersModule = ResellersModule;
exports.ResellersModule = ResellersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([reseller_entity_1.Reseller])],
        controllers: [resellers_controller_1.ResellersController],
        providers: [resellers_service_1.ResellersService],
        exports: [resellers_service_1.ResellersService]
    })
], ResellersModule);
//# sourceMappingURL=resellers.module.js.map