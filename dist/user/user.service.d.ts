import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NewSignUp } from '../lib/types/user';
import { AccountStatus } from '../lib/enums/status.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { AccessLevel } from '../lib/enums/user.enums';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    private excludePassword;
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
    }>;
    findAll(filters?: {
        status?: AccountStatus;
        accessLevel?: AccessLevel;
        search?: string;
        branchId?: number;
        organisationId?: number;
    }, page?: number, limit?: number): Promise<PaginatedResponse<Omit<User, 'password'>>>;
    findOne(searchParameter: number): Promise<{
        user: Omit<User, 'password'> | null;
        message: string;
    }>;
    findOneByEmail(email: string): Promise<{
        user: Omit<User, 'password'> | null;
        message: string;
    }>;
    findOneForAuth(searchParameter: string): Promise<{
        user: User | null;
        message: string;
    }>;
    findOneByUid(searchParameter: number): Promise<{
        user: Omit<User, 'password'> | null;
        message: string;
    }>;
    getUsersByRole(recipients: string[]): Promise<{
        users: Omit<User, 'password'>[] | null;
        message: string;
    }>;
    update(ref: string, updateUserDto: UpdateUserDto): Promise<{
        message: string;
    }>;
    remove(ref: string): Promise<{
        message: string;
    }>;
    createPendingUser(userData: NewSignUp): Promise<void>;
    private schedulePendingUserCleanup;
    restore(ref: number): Promise<{
        message: string;
    }>;
    findByVerificationToken(token: string): Promise<User | null>;
    findByResetToken(token: string): Promise<User | null>;
    markEmailAsVerified(uid: number): Promise<void>;
    setPassword(uid: number, hashedPassword: string): Promise<void>;
    setResetToken(uid: number, token: string): Promise<void>;
    resetPassword(uid: number, hashedPassword: string): Promise<void>;
}
