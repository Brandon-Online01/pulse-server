import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { ApiOperation, ApiTags, ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
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
@ApiUnauthorizedResponse({ description: 'Unauthorized access due to invalid credentials or missing token' })
export class JournalController {
  constructor(private readonly journalService: JournalService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ 
    summary: 'Create a new journal entry',
    description: 'Creates a new journal entry with the provided data. Requires ADMIN, MANAGER, or SUPPORT role.'
  })
  @ApiBody({ type: CreateJournalDto })
  @ApiCreatedResponse({ 
    description: 'Journal entry created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data provided' })
  create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalService.create(createJournalDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ 
    summary: 'Get all journal entries',
    description: 'Retrieves all journal entries. Requires ADMIN, MANAGER, or SUPPORT role.'
  })
  @ApiOkResponse({ 
    description: 'List of all journal entries',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number', example: 1 },
              clientRef: { type: 'string', example: 'CLT123456' },
              fileURL: { type: 'string', example: 'https://storage.example.com/journals/file123.pdf' },
              comments: { type: 'string', example: 'This is a comment' },
              timestamp: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              isDeleted: { type: 'boolean', example: false },
              owner: { 
                type: 'object',
                properties: {
                  uid: { type: 'number', example: 1 }
                }
              },
              branch: { 
                type: 'object',
                properties: {
                  uid: { type: 'number', example: 1 }
                }
              }
            }
          }
        },
        message: { type: 'string', example: 'Success' },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  findAll() {
    return this.journalService.findAll();
  }

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ 
    summary: 'Get a journal entry by reference code',
    description: 'Retrieves a specific journal entry by its reference code. Requires ADMIN, MANAGER, or SUPPORT role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Journal reference code',
    type: 'number',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Journal entry found',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            uid: { type: 'number', example: 1 },
            clientRef: { type: 'string', example: 'CLT123456' },
            fileURL: { type: 'string', example: 'https://storage.example.com/journals/file123.pdf' },
            comments: { type: 'string', example: 'This is a comment' },
            timestamp: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean', example: false },
            owner: { 
              type: 'object',
              properties: {
                uid: { type: 'number', example: 1 }
              }
            },
            branch: { 
              type: 'object',
              properties: {
                uid: { type: 'number', example: 1 }
              }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Journal entry not found' })
  findOne(@Param('ref') ref: number) {
    return this.journalService.findOne(ref);
  }

  @Get('for/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get journals by user reference code',
    description: 'Retrieves all journal entries associated with a specific user. Accessible by all authenticated users.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'User reference code',
    type: 'number',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'List of journal entries for the specified user',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number', example: 1 },
              clientRef: { type: 'string', example: 'CLT123456' },
              fileURL: { type: 'string', example: 'https://storage.example.com/journals/file123.pdf' },
              comments: { type: 'string', example: 'This is a comment' },
              timestamp: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              isDeleted: { type: 'boolean', example: false },
              owner: { 
                type: 'object',
                properties: {
                  uid: { type: 'number', example: 1 }
                }
              },
              branch: { 
                type: 'object',
                properties: {
                  uid: { type: 'number', example: 1 }
                }
              }
            }
          }
        },
        message: { type: 'string', example: 'Success' },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found or has no journal entries' })
  journalsByUser(@Param('ref') ref: number) {
    return this.journalService.journalsByUser(ref);
  }

  @Patch(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ 
    summary: 'Update a journal entry by reference code',
    description: 'Updates a specific journal entry by its reference code. Requires ADMIN, MANAGER, or SUPPORT role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Journal reference code',
    type: 'number',
    example: 1
  })
  @ApiBody({ type: UpdateJournalDto })
  @ApiOkResponse({ 
    description: 'Journal entry updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Journal entry not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data provided' })
  update(@Param('ref') ref: number, @Body() updateJournalDto: UpdateJournalDto) {
    return this.journalService.update(ref, updateJournalDto);
  }

  @Patch('restore/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ 
    summary: 'Restore a journal entry by reference code',
    description: 'Restores a previously deleted journal entry. Requires ADMIN, MANAGER, or SUPPORT role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Journal reference code',
    type: 'number',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Journal entry restored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Journal entry not found' })
  restore(@Param('ref') ref: number) {
    return this.journalService.restore(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT)
  @ApiOperation({ 
    summary: 'Delete a journal entry by reference code',
    description: 'Performs a soft delete on a journal entry. Requires ADMIN, MANAGER, or SUPPORT role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Journal reference code',
    type: 'number',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Journal entry deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Journal entry not found' })
  remove(@Param('ref') ref: number) {
    return this.journalService.remove(ref);
  }
}
