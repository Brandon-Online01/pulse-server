import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user.profile.entity';
import { LicensingModule } from '../licensing/licensing.module';
import { UserEmployeementProfile } from './entities/user.employeement.profile.entity';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([User, UserProfile, UserEmployeementProfile]),
    RewardsModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
