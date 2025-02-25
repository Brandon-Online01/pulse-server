import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { isPublic } from '../decorators/public.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';

// Extended request interface with user property
interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('gps')
@Controller('gps')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) { }

  @Post()
  @isPublic()
  @ApiOperation({ summary: 'create a new tracking record' })
  create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingService.create(createTrackingDto);
  }

  @Post('stops')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a stop event' })
  createStopEvent(@Body() stopData: {
    latitude: number;
    longitude: number;
    startTime: number;
    endTime: number;
    duration: number;
    address?: string;
  }, @Req() req: AuthenticatedRequest) {
    return this.trackingService.createStopEvent(stopData, req.user.uid);
  }

  @Get('stops')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all stops for the current user' })
  getUserStops(@Req() req: AuthenticatedRequest) {
    return this.trackingService.getUserStops(req.user.uid);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all tracking records' })
  findAll() {
    return this.trackingService.findAll();
  }

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a tracking record by reference code' })
  findOne(@Param('ref') ref: number) {
    return this.trackingService.findOne(ref);
  }

  @Get('for/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get tracking by user reference code' })
  trackingByUser(@Param('ref') ref: number) {
    return this.trackingService.trackingByUser(ref);
  }

  @Get('daily/:userId')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get daily tracking summary for a user' })
  getDailyTracking(@Param('userId') userId: number) {
    return this.trackingService.getDailyTracking(userId);
  }

  @Patch('/restore/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'restore a deleted tracking record by reference code' })
  restore(@Param('ref') ref: number) {
    return this.trackingService.restore(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a tracking record by reference code' })
  remove(@Param('ref') ref: number) {
    return this.trackingService.remove(ref);
  }
}
