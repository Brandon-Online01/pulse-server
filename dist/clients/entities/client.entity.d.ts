import { GeneralStatus } from '../../lib/enums/status.enums';
import { Lead } from '../../leads/entities/lead.entity';
import { User } from '../../user/entities/user.entity';
import { Quotation } from '../../shop/entities/quotation.entity';
import { Task } from '../../tasks/entities/task.entity';
import { CheckIn } from '../../check-ins/entities/check-in.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from 'src/branch/entities/branch.entity';
export declare enum CustomerType {
    STANDARD = "standard",
    PREMIUM = "premium",
    ENTERPRISE = "enterprise",
    VIP = "vip",
    WHOLESALE = "wholesale",
    CONTRACT = "contract",
    HARDWARE = "hardware",
    SOFTWARE = "software",
    SERVICE = "service",
    OTHER = "other"
}
export declare class Client {
    uid: number;
    name: string;
    contactPerson: string;
    category: string;
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
    quotations: Quotation[];
    tasks: Task[];
    checkIns: CheckIn[];
    type: CustomerType;
    organisation: Organisation;
    branch: Branch;
}
