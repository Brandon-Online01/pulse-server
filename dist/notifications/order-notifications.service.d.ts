import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../shop/entities/order.entity';
import { ConfigService } from '@nestjs/config';
export declare class OrderNotificationsService {
    private readonly eventEmitter;
    private readonly configService;
    constructor(eventEmitter: EventEmitter2, configService: ConfigService);
    private formatCurrency;
    private sendEmail;
    private getCustomerPriority;
    private getFulfillmentPriority;
    sendOrderNotifications(order: Order): Promise<void>;
}
