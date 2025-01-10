import { User } from '../../user/entities/user.entity';
export declare class Tracking {
    uid: number;
    latitude: number;
    longitude: number;
    address: string;
    notes: string;
    distance: number;
    duration: number;
    owner: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    deletedBy: string;
}
