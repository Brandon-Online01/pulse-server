import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailType } from '../lib/enums/email.enums';
import { Quotation } from '../shop/entities/quotation.entity';
import { ConfigService } from '@nestjs/config';
import {
    OrderData,
    OrderResellerNotificationData,
    OrderInternalNotificationData,
    OrderWarehouseFulfillmentData
} from '../lib/types/email-templates.types';

@Injectable()
export class OrderNotificationsService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService
    ) { }

    private formatCurrency(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(amount);
    }

    private async sendEmail<T>(type: EmailType, data: T): Promise<void> {
        this.eventEmitter.emit('email.send', {
            type,
            data
        });
    }

    private getCustomerPriority(order: Quotation): 'low' | 'medium' | 'high' {
        const orderValue = Number(order.totalAmount) || 0;
        const highPriorityThreshold = this.configService.get<number>('HIGH_PRIORITY_ORDER_THRESHOLD') || 1000;
        const mediumPriorityThreshold = this.configService.get<number>('MEDIUM_PRIORITY_ORDER_THRESHOLD') || 500;

        if (orderValue >= highPriorityThreshold) return 'high';
        if (orderValue >= mediumPriorityThreshold) return 'medium';
        return 'low';
    }

    private getFulfillmentPriority(order: Quotation): 'standard' | 'express' | 'rush' {
        const priority = this.getCustomerPriority(order);
        switch (priority) {
            case 'high': return 'rush';
            case 'medium': return 'express';
            default: return 'standard';
        }
    }

    async sendOrderNotifications(order: Quotation): Promise<void> {
        const currency = this.configService.get<string>('CURRENCY_CODE') || 'USD';
        const baseOrderData: OrderData = {
            name: order.client?.name || 'Valued Customer',
            orderId: order.orderNumber,
            expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            total: Number(order.totalAmount) || 0,
            currency,
            shippingMethod: order.shippingMethod || 'Standard Shipping'
        };

        // 1. Send customer order confirmation
        await this.sendEmail(EmailType.ORDER_CONFIRMATION, baseOrderData);

        // 2. Send reseller notification if applicable
        if (order.reseller) {
            const resellerData: OrderResellerNotificationData = {
                ...baseOrderData,
                resellerCommission: Number(order.resellerCommission) || 0,
                resellerCode: String(order.reseller?.uid),
            };
            await this.sendEmail(EmailType.ORDER_RESELLER_NOTIFICATION, resellerData);
        }

        // 3. Send internal team notification
        const internalData: OrderInternalNotificationData = {
            ...baseOrderData,
            customerType: order.client?.type || 'Standard',
            priority: this.getCustomerPriority(order),
            notes: order.notes
        };
        await this.sendEmail(EmailType.ORDER_INTERNAL_NOTIFICATION, internalData);

        // 4. Send warehouse fulfillment request
        const warehouseData: OrderWarehouseFulfillmentData = {
            ...baseOrderData,
            fulfillmentPriority: this.getFulfillmentPriority(order),
            shippingInstructions: order.shippingInstructions,
            packagingRequirements: order.packagingRequirements,
            items: order.quotationItems.map(item => ({
                sku: item.product.sku,
                quantity: item.quantity,
                location: item.product.warehouseLocation
            }))
        };
        await this.sendEmail(EmailType.ORDER_WAREHOUSE_FULFILLMENT, warehouseData);
    }
} 