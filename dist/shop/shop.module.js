"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopModule = void 0;
const common_1 = require("@nestjs/common");
const shop_service_1 = require("./shop.service");
const shop_controller_1 = require("./shop.controller");
const typeorm_1 = require("@nestjs/typeorm");
const quotation_entity_1 = require("./entities/quotation.entity");
const product_entity_1 = require("../products/entities/product.entity");
const banners_entity_1 = require("./entities/banners.entity");
const clients_module_1 = require("../clients/clients.module");
const notifications_module_1 = require("../notifications/notifications.module");
const communication_module_1 = require("../communication/communication.module");
const licensing_module_1 = require("../licensing/licensing.module");
const shop_gateway_1 = require("./shop.gateway");
const products_module_1 = require("../products/products.module");
let ShopModule = class ShopModule {
};
exports.ShopModule = ShopModule;
exports.ShopModule = ShopModule = __decorate([
    (0, common_1.Module)({
        imports: [
            licensing_module_1.LicensingModule,
            clients_module_1.ClientsModule,
            notifications_module_1.NotificationsModule,
            communication_module_1.CommunicationModule,
            products_module_1.ProductsModule,
            typeorm_1.TypeOrmModule.forFeature([quotation_entity_1.Quotation, product_entity_1.Product, banners_entity_1.Banners])
        ],
        controllers: [shop_controller_1.ShopController],
        providers: [shop_service_1.ShopService, shop_gateway_1.ShopGateway],
        exports: [shop_service_1.ShopService]
    })
], ShopModule);
//# sourceMappingURL=shop.module.js.map