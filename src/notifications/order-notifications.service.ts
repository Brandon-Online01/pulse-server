import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailType } from '../lib/enums/email.enums';
import { Quotation } from '../shop/entities/quotation.entity';
import { ConfigService } from '@nestjs/config';
import {
    QuotationData,
    QuotationResellerNotificationData,
    QuotationInternalNotificationData,
    QuotationWarehouseFulfillmentData
} from '../lib/types/email-templates.types';

@Injectable()
export class OrderNotificationsService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService
    ) { }

    private async sendEmail<T>(type: EmailType, data: T): Promise<void> {
        this.eventEmitter.emit('email.send', {
            type,
            data
        });
    }

    private getCustomerPriority(quotation: Quotation): 'low' | 'medium' | 'high' {
        const quotationValue = Number(quotation.totalAmount) || 0;
        const highPriorityThreshold = this.configService.get<number>('HIGH_PRIORITY_ORDER_THRESHOLD') || 1000;
        const mediumPriorityThreshold = this.configService.get<number>('MEDIUM_PRIORITY_ORDER_THRESHOLD') || 500;

        if (quotationValue >= highPriorityThreshold) return 'high';
        if (quotationValue >= mediumPriorityThreshold) return 'medium';
        return 'low';
    }

    private getFulfillmentPriority(quotation: Quotation): 'standard' | 'express' | 'rush' {
        const priority = this.getCustomerPriority(quotation);
        switch (priority) {
            case 'high': return 'rush';
            case 'medium': return 'express';
            default: return 'standard';
        }
    }

    async sendQuotationNotifications(quotation: Quotation): Promise<void> {
        const currency = this.configService.get<string>('CURRENCY_CODE') || 'USD';
        const baseOrderData: QuotationData = {
            name: quotation.client?.name || 'Valued Customer',
            quotationId: quotation.quotationNumber,
            expectedDelivery: quotation?.validUntil,
            total: Number(quotation.totalAmount) || 0,
            currency,
            shippingMethod: quotation.shippingMethod || 'Standard Shipping',
            validUntil: quotation?.validUntil,
            quotationItems: quotation.quotationItems.map(item => ({
                quantity: item.quantity,
                product: { uid: String(item.product.uid) },
                totalPrice: Number(item.totalPrice) || 0
            }))
        };

        // 1. Send customer order confirmation
        await this.sendEmail(EmailType.NEW_QUOTATION_CLIENT, baseOrderData);

        // 2. Send reseller notification if applicable
        if (quotation.reseller) {
            const resellerData: QuotationResellerNotificationData = {
                ...baseOrderData,
                resellerCommission: Number(quotation.resellerCommission) || 0,
                resellerCode: String(quotation.reseller?.uid),
            };
            await this.sendEmail(EmailType.NEW_QUOTATION_RESELLER, resellerData);
        }

        // 3. Send internal team notification
        const internalData: QuotationInternalNotificationData = {
            ...baseOrderData,
            customerType: quotation.client?.type || 'Standard',
            priority: this.getCustomerPriority(quotation),
            notes: quotation.notes
        };
        await this.sendEmail(EmailType.NEW_QUOTATION_INTERNAL, internalData);

        // 4. Send warehouse fulfillment request
        const warehouseData: QuotationWarehouseFulfillmentData = {
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
        await this.sendEmail(EmailType.NEW_QUOTATION_WAREHOUSE_FULFILLMENT, warehouseData);
    }
} 