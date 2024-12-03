import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';

@ApiTags('leads')
@Controller('leads')
@UseGuards(RoleGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'create a new lead' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'get all leads' })
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'get a lead by reference code' })
  findOne(@Param('referenceCode') referenceCode: number) {
    return this.leadsService.findOne(referenceCode);
  }

  @Patch(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'update a lead by reference code' })
  update(@Param('referenceCode') referenceCode: number, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(referenceCode, updateLeadDto);
  }

  @Patch('restore/:referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'restore a lead by reference code' })
  restore(@Param('referenceCode') referenceCode: number) {
    return this.leadsService.restore(referenceCode);
  }


  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'soft delete a lead by reference code' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.leadsService.remove(referenceCode);
  }
}
