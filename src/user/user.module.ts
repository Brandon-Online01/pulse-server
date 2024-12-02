import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user.profile.entity';
import { UserEmployeementProfile } from './entities/user.employeement.profile.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from 'src/config/redis.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserEmployeementProfile]),
    CacheModule.register(redisConfig)
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
