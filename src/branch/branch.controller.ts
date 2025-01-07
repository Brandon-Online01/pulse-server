import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';
import { isPublic } from '../decorators/public.decorator';

@ApiTags('branch')
@Controller('branch')
@UseGuards(AuthGuard, RoleGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) { }

  @Post()
  @isPublic()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'create a new branch' })
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'get all branches' })
  findAll() {
    return this.branchService.findAll();
  }

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'get a branch by reference code' })
  findOne(@Param('ref') ref: string) {
    return this.branchService.findOne(ref);
  }

  @Patch(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'update a branch by reference code' })
  update(@Param('ref') ref: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(ref, updateBranchDto);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'soft delete a branch by reference code' })
  remove(@Param('ref') ref: string) {
    return this.branchService.remove(ref);
  }
}
