import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';
import { UpdateJournalDto } from './dto/update-journal.dto';

@ApiTags('journal')
@Controller('journal')
@UseGuards(RoleGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'create a new journal entry' })
  create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalService.create(createJournalDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get all journal entries' })
  findAll() {
    return this.journalService.findAll();
  }

  @Get(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a journal entry by reference code' })
  findOne(@Param('referenceCode') referenceCode: number) {
    return this.journalService.findOne(referenceCode);
  }

  @Patch(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'update a journal entry by reference code' })
  update(@Param('referenceCode') referenceCode: number, @Body() updateJournalDto: UpdateJournalDto) {
    return this.journalService.update(referenceCode, updateJournalDto);
  }

  @Patch('restore/:referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'restore a journal entry by reference code' })
  restore(@Param('referenceCode') referenceCode: number) {
    return this.journalService.restore(referenceCode);
  }

  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'delete a journal entry by reference code' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.journalService.remove(referenceCode);
  }
}
