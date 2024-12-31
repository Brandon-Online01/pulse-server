import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('rewards')
@Controller('rewards')
@UseGuards(AuthGuard, RoleGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) { }

  @Post('award-xp')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
  @ApiOperation({ summary: 'award XP to a user' })
  awardXP(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardsService.awardXP(createRewardDto);
  }

  @Get('user/:  ')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER)
  @ApiOperation({ summary: 'get user rewards' })
  getUserRewards(@Param('reference') reference: string) {
    return this.rewardsService.getUserRewards(reference);
  }

  @Get('leaderboard')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.USER)
  @ApiOperation({ summary: 'get rewards leaderboard' })
  getLeaderboard() {
    return this.rewardsService.getLeaderboard();
  }
}
