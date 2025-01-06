import { Repository } from 'typeorm';
import { PendingSignup } from './entities/pending-signup.entity';
export declare class PendingSignupService {
    private pendingSignupRepository;
    constructor(pendingSignupRepository: Repository<PendingSignup>);
    create(email: string, verificationToken: string): Promise<PendingSignup>;
    findByEmail(email: string): Promise<PendingSignup | null>;
    findByToken(token: string): Promise<PendingSignup | null>;
    markAsVerified(id: number): Promise<void>;
    delete(id: number): Promise<void>;
    cleanupExpired(): Promise<void>;
}
