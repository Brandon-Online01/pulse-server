import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpStatus } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { 
  ApiOperation, 
  ApiQuery, 
  ApiTags, 
  ApiParam, 
  ApiBody, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse, 
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { Client } from './entities/client.entity';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';

@ApiTags('clients')
@Controller('clients')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('clients')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Create a new client',
    description: 'Creates a new client with the provided details including contact information and address'
  })
  @ApiBody({ type: CreateClientDto })
  @ApiCreatedResponse({ 
    description: 'Client created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error creating client' }
      }
    }
  })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get all clients',
    description: 'Retrieves a paginated list of all clients with optional filtering'
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of records per page, defaults to system setting' })
  @ApiOkResponse({
    description: 'List of clients retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clientsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : Number(process.env.DEFAULT_PAGE_LIMIT)
    );
  }

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a client by reference code',
    description: 'Retrieves detailed information about a specific client'
  })
  @ApiParam({ name: 'ref', description: 'Client reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Client details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        client: { 
          type: 'object',
          properties: {
            uid: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            // Other client properties
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Client not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Client not found' },
        client: { type: 'null' }
      }
    }
  })
  findOne(@Param('ref') ref: number) {
    return this.clientsService.findOne(ref);
  }

  @Patch(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Update a client',
    description: 'Updates an existing client with the provided information'
  })
  @ApiParam({ name: 'ref', description: 'Client reference code or ID', type: 'number' })
  @ApiBody({ type: UpdateClientDto })
  @ApiOkResponse({ 
    description: 'Client updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Client not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Client not found' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error updating client' }
      }
    }
  })
  update(@Param('ref') ref: number, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(ref, updateClientDto);
  }

  @Patch('restore/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Restore a deleted client',
    description: 'Restores a previously deleted client'
  })
  @ApiParam({ name: 'ref', description: 'Client reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Client restored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Client not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Client not found' }
      }
    }
  })
  restore(@Param('ref') ref: number) {
    return this.clientsService.restore(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Soft delete a client',
    description: 'Marks a client as deleted without removing it from the database'
  })
  @ApiParam({ name: 'ref', description: 'Client reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Client deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Client not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error deleting client' }
      }
    }
  })
  remove(@Param('ref') ref: number) {
    return this.clientsService.remove(ref);
  }
}