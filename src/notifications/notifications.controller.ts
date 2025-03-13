import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard, RoleGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ summary: 'create a new notification' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ summary: 'get all notifications' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ summary: 'get a notification by reference code' })
  findOne(@Param('ref') ref: number) {
    return this.notificationsService.findOne(ref);
  }

  @Get('/personal/:ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ summary: 'get a notification by reference code for a user' })
  findForUser(@Param('ref') ref: number) {
    return this.notificationsService.findForUser(ref);
  }

  @Patch(':ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ summary: 'update a notification by reference code' })
  update(@Param('ref') ref: number, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(ref, updateNotificationDto);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'soft delete a notification by reference code' })
  remove(@Param('ref') ref: number) {
    return this.notificationsService.remove(ref);
  }
}
