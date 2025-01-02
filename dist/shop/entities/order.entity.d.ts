import { Client } from '../../clients/entities/client.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../lib/enums/status.enums';
import { User } from 'src/user/entities/user.entity';
export declare class Order {
    uid: number;
    orderNumber: string;
    totalAmount: number;
    totalItems: number;
    status: OrderStatus;
    orderDate: Date;
    placedBy: User;
    client: Client;
    orderItems: OrderItem[];
    shippingMethod: string;
    notes: string;
    shippingInstructions: string;
    packagingRequirements: string;
    reseller: User;
    resellerCommission: number;
    createdAt: Date;
    updatedAt: Date;
}
