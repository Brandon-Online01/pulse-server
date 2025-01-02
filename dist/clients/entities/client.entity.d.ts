import { GeneralStatus } from '../../lib/enums/status.enums';
import { Lead } from '../../leads/entities/lead.entity';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../shop/entities/order.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { CheckIn } from 'src/check-ins/entities/check-in.entity';
export declare enum CustomerType {
    STANDARD = "standard",
    PREMIUM = "premium",
    VIP = "vip",
    WHOLESALE = "wholesale"
}
export declare class Client {
    uid: number;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    alternativePhone: string;
    website: string;
    logo: string;
    description: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    createdAt: Date;
    updatedAt: Date;
    status: GeneralStatus;
    isDeleted: boolean;
    ref: string;
    assignedSalesRep: User;
    leads: Lead[];
    orders: Order[];
    tasks: Task[];
    checkIns: CheckIn[];
    type: CustomerType;
}
