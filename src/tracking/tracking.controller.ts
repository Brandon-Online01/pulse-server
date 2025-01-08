import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { isPublic } from '../decorators/public.decorator';
import { AccessLevel } from '../lib/enums/user.enums';

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
