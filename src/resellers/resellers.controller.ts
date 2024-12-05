import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ResellersService } from './resellers.service';
import { CreateResellerDto } from './dto/create-reseller.dto';
import { UpdateResellerDto } from './dto/update-reseller.dto';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/enums';
import { Roles } from '../decorators/role.decorator';
import { ApiOperation } from '@nestjs/swagger';

@ApiTags('resellers')
@Controller('resellers')
@UseGuards(RoleGuard, AuthGuard)
export class ResellersController {
  constructor(private readonly resellersService: ResellersService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a new reseller' })
  create(@Body() createResellerDto: CreateResellerDto) {
    return this.resellersService.create(createResellerDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all resellers' })
  findAll() {
    return this.resellersService.findAll();
  }

  @Get(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a reseller by reference code' })
  findOne(@Param('referenceCode') referenceCode: number) {
    return this.resellersService.findOne(referenceCode);
  }

  @Patch(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a reseller' })
  update(@Param('referenceCode') referenceCode: number, @Body() updateResellerDto: UpdateResellerDto) {
    return this.resellersService.update(referenceCode, updateResellerDto);
  }

  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a reseller' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.resellersService.remove(referenceCode);
  }
}
