import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';

@ApiTags('user')
@Controller('user')
@UseGuards(RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':searchParameter')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Get a user by a search parameter i.e email, phone number, reference code' })
  findOne(@Param('searchParameter') searchParameter: string) {
    return this.userService.findOne(searchParameter);
  }

  @Patch(':referenceCode')
  @ApiOperation({ summary: 'Update a user by reference code' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  update(
    @Param('referenceCode') referenceCode: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(referenceCode, updateUserDto);
  }

  @Patch('restore/:referenceCode')
  @ApiOperation({ summary: 'Restore a deleted user by reference code' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  restore(@Param('referenceCode') referenceCode: number) {
    return this.userService.restore(referenceCode);
  }

  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'Soft delete a user by reference code' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.userService.remove(referenceCode);
  }
}
