import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NewSignUp } from '../lib/types/user';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        users: User[] | null;
        message: string;
    }>;
    findOne(searchParameter: number): Promise<{
        user: User | null;
        message: string;
    }>;
    findOneByEmail(email: string): Promise<{
        user: User | null;
        message: string;
    }>;
    findOneForAuth(searchParameter: string): Promise<{
        user: User | null;
        message: string;
    }>;
    getUsersByRole(recipients: string[]): Promise<{
        users: User[] | null;
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
