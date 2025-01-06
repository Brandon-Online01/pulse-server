import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RewardsModule } from '../rewards/rewards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingSignup } from './entities/pending-signup.entity';
import { PendingSignupService } from './pending-signup.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PendingSignup]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
        }),
        UserModule,
        RewardsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, PendingSignupService],
    exports: [AuthService],
})
export class AuthModule { }
