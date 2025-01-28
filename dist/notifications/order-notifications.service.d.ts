import { EventEmitter2 } from '@nestjs/event-emitter';
import { Quotation } from '../shop/entities/quotation.entity';
import { ConfigService } from '@nestjs/config';
export declare class OrderNotificationsService {
    private readonly eventEmitter;
    private readonly configService;
    constructor(eventEmitter: EventEmitter2, configService: ConfigService);
    private sendEmail;
    private getCustomerPriority;
    private getFulfillmentPriority;
    sendQuotationNotifications(quotation: Quotation): Promise<void>;
}
