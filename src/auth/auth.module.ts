import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RewardsModule } from '../rewards/rewards.module';
import { PendingSignupService } from './pending-signup.service';
import { PasswordResetService } from './password-reset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingSignup } from './entities/pending-signup.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PendingSignup, PasswordReset]),
        JwtModule.register({
            global: true,
            secret: 'K9HXmP$2vL5nR8qY3wZ7jB4cF6hN9kM@pT2xS5vA8dG4jE7mQ9nU',
            signOptions: { expiresIn: '1h' },
        }),
        UserModule,
        RewardsModule,
        LicensingModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, PendingSignupService, PasswordResetService],
    exports: [AuthService],
})
export class AuthModule { }
