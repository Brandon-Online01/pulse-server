import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user.profile.entity';
import { UserEmployeementProfile } from './entities/user.employeement.profile.entity';
import { OrganisationModule } from '../organisation/organisation.module';
import { BranchModule } from '../branch/branch.module';
import { UserTarget } from './entities/user-target.entity';
import { LicensingModule } from '../licensing/licensing.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			UserProfile,
			UserEmployeementProfile,
			UserTarget,
		]),
		OrganisationModule,
		BranchModule,
		LicensingModule,
		RewardsModule
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService, TypeOrmModule],
})
export class UserModule {}
