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
exports.OrderNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const email_enums_1 = require("../lib/enums/email.enums");
const config_1 = require("@nestjs/config");
let OrderNotificationsService = class OrderNotificationsService {
    constructor(eventEmitter, configService) {
        this.eventEmitter = eventEmitter;
        this.configService = configService;
    }
    async sendEmail(type, data) {
        this.eventEmitter.emit('email.send', {
            type,
            data
        });
    }
    getCustomerPriority(quotation) {
        const quotationValue = Number(quotation.totalAmount) || 0;
        const highPriorityThreshold = this.configService.get('HIGH_PRIORITY_ORDER_THRESHOLD') || 1000;
        const mediumPriorityThreshold = this.configService.get('MEDIUM_PRIORITY_ORDER_THRESHOLD') || 500;
        if (quotationValue >= highPriorityThreshold)
            return 'high';
        if (quotationValue >= mediumPriorityThreshold)
            return 'medium';
        return 'low';
    }
    getFulfillmentPriority(quotation) {
        const priority = this.getCustomerPriority(quotation);
        switch (priority) {
            case 'high': return 'rush';
            case 'medium': return 'express';
            default: return 'standard';
        }
    }
    async sendQuotationNotifications(quotation) {
        const currency = this.configService.get('CURRENCY_CODE') || 'USD';
        const baseOrderData = {
            name: quotation.client?.name || 'Valued Customer',
            quotationId: quotation.quotationNumber,
            validUntil: quotation?.validUntil,
            total: Number(quotation.totalAmount) || 0,
            currency,
            quotationItems: quotation.quotationItems.map(item => ({
                quantity: item.quantity,
                product: { uid: Number(item.product.uid), name: item.product.name, code: item.product?.productRef },
                totalPrice: Number(item.totalPrice) || 0
            }))
        };
        await this.sendEmail(email_enums_1.EmailType.NEW_QUOTATION_CLIENT, baseOrderData);
        if (quotation.reseller) {
            const resellerData = {
                ...baseOrderData,
                resellerCommission: Number(quotation.resellerCommission) || 0,
                resellerCode: String(quotation.reseller?.uid),
            };
            await this.sendEmail(email_enums_1.EmailType.NEW_QUOTATION_RESELLER, resellerData);
        }
        const internalData = {
            ...baseOrderData,
            customerType: quotation.client?.type || 'Standard',
            priority: this.getCustomerPriority(quotation),
            notes: quotation.notes
        };
        await this.sendEmail(email_enums_1.EmailType.NEW_QUOTATION_INTERNAL, internalData);
        const warehouseData = {
            ...baseOrderData,
            fulfillmentPriority: this.getFulfillmentPriority(quotation),
            shippingInstructions: quotation.shippingInstructions,
            packagingRequirements: quotation.packagingRequirements,
            items: quotation.quotationItems.map(item => ({
                sku: item.product.sku,
                quantity: item.quantity,
                location: item.product.warehouseLocation
            }))
        };
        await this.sendEmail(email_enums_1.EmailType.NEW_QUOTATION_WAREHOUSE_FULFILLMENT, warehouseData);
    }
};
exports.OrderNotificationsService = OrderNotificationsService;
exports.OrderNotificationsService = OrderNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], OrderNotificationsService);
//# sourceMappingURL=order-notifications.service.js.map