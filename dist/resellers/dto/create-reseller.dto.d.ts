import { ResellerStatus } from '../../lib/enums/product.enums';
export declare class CreateResellerDto {
    name: string;
    description: string;
    logo: string;
    website: string;
    status: ResellerStatus;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
}
