import { UserService } from './user.service';
import { RoleGuard } from '../guards/role.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/role.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { isPublic } from '../decorators/public.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AccountStatus } from '../lib/enums/status.enums';

@ApiTags('user')
@Controller('user')
@UseGuards(AuthGuard, RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
  @ApiOperation({ summary: 'get all users' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: AccountStatus,
    @Query('accessLevel') accessLevel?: AccessLevel,
    @Query('search') search?: string,
    @Query('branchId') branchId?: number,
    @Query('organisationId') organisationId?: number,
  ) {
    const filters = {
      ...(status && { status }),
      ...(accessLevel && { accessLevel }),
      ...(search && { search }),
      ...(branchId && { branchId: Number(branchId) }),
      ...(organisationId && { organisationId: Number(organisationId) }),
    };

    return this.userService.findAll(
      filters,
      page ? Number(page) : 1,
      limit ? Number(limit) : Number(process.env.DEFAULT_PAGE_LIMIT)
    );
  }

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a user by a search parameter i.e email, phone number, reference code' })
  findOne(@Param('searchParameter') searchParameter: number) {
    return this.userService.findOne(searchParameter);
  }

  @Patch(':ref')
  @ApiOperation({ summary: 'update a user by reference code' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  update(
    @Param('ref') ref: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(String(ref), updateUserDto);
  }

  @Patch('restore/:ref')
  @ApiOperation({ summary: 'restore a deleted user by reference code' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restore(@Param('ref') ref: number) {
    return this.userService.restore(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a user by reference code' })
  remove(@Param('ref') ref: string) {
    return this.userService.remove(ref);
  }
}
