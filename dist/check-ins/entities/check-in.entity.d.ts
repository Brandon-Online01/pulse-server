import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../user/entities/user.entity';
export declare class CheckIn {
    uid: number;
    checkInTime: Date;
    checkInPhoto: string;
    checkInLocation: string;
    checkOutTime: Date;
    checkOutPhoto: string;
    checkOutLocation: string;
    duration: string;
    owner: User;
    organisation: Organisation;
    branch: Branch;
    client: Client;
}
