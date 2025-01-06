import { Repository } from 'typeorm';
import { PasswordReset } from './entities/password-reset.entity';
export declare class PasswordResetService {
    private passwordResetRepository;
    constructor(passwordResetRepository: Repository<PasswordReset>);
    create(email: string, resetToken: string): Promise<PasswordReset>;
    findByEmail(email: string): Promise<PasswordReset | null>;
    findByToken(token: string): Promise<PasswordReset | null>;
    markAsUsed(uid: number): Promise<void>;
    delete(uid: number): Promise<void>;
    cleanupExpired(): Promise<void>;
}
