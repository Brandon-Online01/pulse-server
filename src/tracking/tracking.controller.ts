import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { AccessLevel } from 'src/lib/enums/enums';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Create a new tracking record' })
  create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingService.create(createTrackingDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Get all tracking records' })
  findAll() {
    return this.trackingService.findAll();
  }

  @Get(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Get a tracking record by reference code' })
  findOne(@Param('referenceCode') referenceCode: number) {
    return this.trackingService.findOne(referenceCode);
  }

  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Delete a tracking record by reference code' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.trackingService.remove(referenceCode);
  }

  @Patch('/restore/:referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Restore a deleted tracking record by reference code' })
  restore(@Param('referenceCode') referenceCode: number) {
    return this.trackingService.restore(referenceCode);
  }
}
