import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { AuthGuard } from '../guards/auth.guard';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';

@ApiTags('journal')
@Controller('journal')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('journal')
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

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'get a journal entry by reference code' })
  findOne(@Param('ref') ref: number) {
    return this.journalService.findOne(ref);
  }

  @Get('for/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get journals by user reference code' })
  journalsByUser(@Param('ref') ref: number) {
    return this.journalService.journalsByUser(ref);
  }

  @Patch(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'update a journal entry by reference code' })
  update(@Param('ref') ref: number, @Body() updateJournalDto: UpdateJournalDto) {
    return this.journalService.update(ref, updateJournalDto);
  }

  @Patch('restore/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'restore a journal entry by reference code' })
  restore(@Param('ref') ref: number) {
    return this.journalService.restore(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ summary: 'delete a journal entry by reference code' })
  remove(@Param('ref') ref: number) {
    return this.journalService.remove(ref);
  }
}
