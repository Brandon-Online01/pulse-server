import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './entities/password-reset.entity';

@Injectable()
export class PasswordResetService {
    constructor(
        @InjectRepository(PasswordReset)
        private passwordResetRepository: Repository<PasswordReset>,
    ) { }

    async create(email: string, resetToken: string): Promise<PasswordReset> {
        const passwordReset = this.passwordResetRepository.create({
            email,
            resetToken,
            tokenExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        });

        return this.passwordResetRepository.save(passwordReset);
    }

    async findByEmail(email: string): Promise<PasswordReset | null> {
        return this.passwordResetRepository.findOne({
            where: { email, isUsed: false },
            order: { createdAt: 'DESC' }
        });
    }

    async findByToken(token: string): Promise<PasswordReset | null> {
        return this.passwordResetRepository.findOne({
            where: { resetToken: token, isUsed: false }
        });
    }

    async markAsUsed(uid: number): Promise<void> {
        await this.passwordResetRepository.update(uid, { isUsed: true });
    }

    async delete(uid: number): Promise<void> {
        await this.passwordResetRepository.delete(uid);
    }

    async cleanupExpired(): Promise<void> {
        await this.passwordResetRepository.delete({
            tokenExpires: new Date(),
            isUsed: false
        });
    }
} 