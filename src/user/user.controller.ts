import { UserService } from './user.service';
import { RoleGuard } from '../guards/role.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/role.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { isPublic } from '../decorators/public.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

@ApiTags('user')
@Controller('user')
// @UseGuards(AuthGuard, RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @isPublic()
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a user by a search parameter i.e email, phone number, reference code' })
  findOne(@Param('searchParameter') searchParameter: number) {
    return this.userService.findOne(searchParameter);
  }

  @Patch(':ref')
  @ApiOperation({ summary: 'update a user by reference code' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  update(
    @Param('ref') ref: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(String(ref), updateUserDto);
  }

  @Patch('restore/:ref')
  @ApiOperation({ summary: 'restore a deleted user by reference code' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restore(@Param('ref') ref: number) {
    return this.userService.restore(ref);
  }

  @Delete(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a user by reference code' })
  remove(@Param('ref') ref: string) {
    return this.userService.remove(ref);
  }
}
