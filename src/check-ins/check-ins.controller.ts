import { Controller, Post, Body, Patch, Param, UseGuards, Get } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { CreateCheckOutDto } from './dto/create-check-out.dto';
import { AccessLevel } from 'src/lib/enums/user.enums';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

@ApiTags('check-ins')
@Controller('check-ins')
@UseGuards(AuthGuard, RoleGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'manage attendance, check in' })
  checkIn(@Body() createCheckInDto: CreateCheckInDto) {
    return this.checkInsService.checkIn(createCheckInDto);
  }

  @Get('status/:reference')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get check ins' })
  checkInStatus(@Param('reference') reference: number) {
    return this.checkInsService.checkInStatus(reference);
  }

  @Patch(':reference')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'manage attendance, check out' })
  checkOut(@Body() createCheckOutDto: CreateCheckOutDto) {
    return this.checkInsService.checkOut(createCheckOutDto);
  }
}
