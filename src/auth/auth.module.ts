import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RewardsModule } from '../rewards/rewards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingSignup } from './entities/pending-signup.entity';
import { PendingSignupService } from './pending-signup.service';
import { PasswordReset } from './entities/password-reset.entity';
import { PasswordResetService } from './password-reset.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PendingSignup, PasswordReset]),
        JwtModule.register({
            global: true,
            secret: 'nbc6a5WW7BW4iMApC1FUtRhJPZuk0WNm4qoF7Sg9q553sV601tx2scFGVpLUxW6QvdRrXRKgPiOFMuJ7qNJ7CJcTf7qapNarmsfe',
            signOptions: { expiresIn: '8h' },
        }),
        UserModule,
        RewardsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, PendingSignupService, PasswordResetService],
    exports: [AuthService],
})
export class AuthModule { }
