import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingSignup } from './entities/pending-signup.entity';

@Injectable()
export class PendingSignupService {
    constructor(
        @InjectRepository(PendingSignup)
        private pendingSignupRepository: Repository<PendingSignup>,
    ) { }

    async create(email: string, verificationToken: string): Promise<PendingSignup> {
        const pendingSignup = this.pendingSignupRepository.create({
            email,
            verificationToken,
            tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        return this.pendingSignupRepository.save(pendingSignup);
    }

    async findByEmail(email: string): Promise<PendingSignup | null> {
        return this.pendingSignupRepository.findOne({ where: { email } });
    }

    async findByToken(token: string): Promise<PendingSignup | null> {
        return this.pendingSignupRepository.findOne({ where: { verificationToken: token } });
    }

    async markAsVerified(id: number): Promise<void> {
        await this.pendingSignupRepository.update(id, { isVerified: true });
    }

    async delete(id: number): Promise<void> {
        await this.pendingSignupRepository.delete(id);
    }

    async cleanupExpired(): Promise<void> {
        await this.pendingSignupRepository.delete({
            tokenExpires: new Date(),
            isVerified: false
        });
    }
} 