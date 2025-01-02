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
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(amount);
    }
    async sendEmail(type, data) {
        this.eventEmitter.emit('email.send', {
            type,
            data
        });
    }
    getCustomerPriority(order) {
        const orderValue = Number(order.totalAmount) || 0;
        const highPriorityThreshold = this.configService.get('HIGH_PRIORITY_ORDER_THRESHOLD') || 1000;
        const mediumPriorityThreshold = this.configService.get('MEDIUM_PRIORITY_ORDER_THRESHOLD') || 500;
        if (orderValue >= highPriorityThreshold)
            return 'high';
        if (orderValue >= mediumPriorityThreshold)
            return 'medium';
        return 'low';
    }
    getFulfillmentPriority(order) {
        const priority = this.getCustomerPriority(order);
        switch (priority) {
            case 'high': return 'rush';
            case 'medium': return 'express';
            default: return 'standard';
        }
    }
    async sendOrderNotifications(order) {
        const currency = this.configService.get('CURRENCY_CODE') || 'USD';
        const baseOrderData = {
            name: order.client?.name || 'Valued Customer',
            orderId: order.orderNumber,
            expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            total: Number(order.totalAmount) || 0,
            currency,
            shippingMethod: order.shippingMethod || 'Standard Shipping'
        };
        await this.sendEmail(email_enums_1.EmailType.ORDER_CONFIRMATION, baseOrderData);
        if (order.reseller) {
            const resellerData = {
                ...baseOrderData,
                resellerCommission: Number(order.resellerCommission) || 0,
                resellerCode: String(order.reseller?.uid),
            };
            await this.sendEmail(email_enums_1.EmailType.ORDER_RESELLER_NOTIFICATION, resellerData);
        }
        const internalData = {
            ...baseOrderData,
            customerType: order.client?.type || 'Standard',
            priority: this.getCustomerPriority(order),
            notes: order.notes
        };
        await this.sendEmail(email_enums_1.EmailType.ORDER_INTERNAL_NOTIFICATION, internalData);
        const warehouseData = {
            ...baseOrderData,
            fulfillmentPriority: this.getFulfillmentPriority(order),
            shippingInstructions: order.shippingInstructions,
            packagingRequirements: order.packagingRequirements,
            items: order.orderItems.map(item => ({
                sku: item.product.sku,
                quantity: item.quantity,
                location: item.product.warehouseLocation
            }))
        };
        await this.sendEmail(email_enums_1.EmailType.ORDER_WAREHOUSE_FULFILLMENT, warehouseData);
    }
};
exports.OrderNotificationsService = OrderNotificationsService;
exports.OrderNotificationsService = OrderNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], OrderNotificationsService);
//# sourceMappingURL=order-notifications.service.js.map