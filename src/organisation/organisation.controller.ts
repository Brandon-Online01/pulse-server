import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { ApiOperation, ApiTags, ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@ApiTags('org')
@Controller('org')
@UseGuards(AuthGuard, RoleGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized access due to invalid credentials or missing token' })
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Create a new organisation',
    description: 'Creates a new organisation with the provided data. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
  })
  @ApiBody({ type: CreateOrganisationDto })
  @ApiCreatedResponse({ 
    description: 'Organisation created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' },
        data: {
          type: 'object',
          properties: {
            uid: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Acme Inc.' },
            email: { type: 'string', example: 'brandon@loro.co.za' },
            phone: { type: 'string', example: '123-456-7890' },
            contactPerson: { type: 'string', example: 'Brandon Nkawu' },
            website: { type: 'string', example: 'https://www.acme.com' },
            logo: { type: 'string', example: 'https://www.acme.com/logo.png' },
            orgref: { type: 'string', example: 'ORG123456' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean', example: false },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'Cape Town' },
                state: { type: 'string', example: 'Western Cape' },
                postalCode: { type: 'string', example: '8001' },
                country: { type: 'string', example: 'South Africa' },
                latitude: { type: 'number', example: -33.9249 },
                longitude: { type: 'number', example: 18.4241 }
              }
            }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data provided' })
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationService.create(createOrganisationDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Get all organisations',
    description: 'Retrieves all organisations. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
  })
  @ApiOkResponse({ 
    description: 'List of all organisations',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Acme Inc.' },
              email: { type: 'string', example: 'brandon@loro.co.za' },
              phone: { type: 'string', example: '123-456-7890' },
              contactPerson: { type: 'string', example: 'Brandon Nkawu' },
              website: { type: 'string', example: 'https://www.acme.com' },
              logo: { type: 'string', example: 'https://www.acme.com/logo.png' },
              orgref: { type: 'string', example: 'ORG123456' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              isDeleted: { type: 'boolean', example: false }
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
    return this.organisationService.findAll();
  }

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Get an organisation by reference code',
    description: 'Retrieves a specific organisation by its reference code. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Organisation reference code',
    type: 'string',
    example: 'ORG123456'
  })
  @ApiOkResponse({ 
    description: 'Organisation found',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            uid: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Acme Inc.' },
            email: { type: 'string', example: 'brandon@loro.co.za' },
            phone: { type: 'string', example: '123-456-7890' },
            contactPerson: { type: 'string', example: 'Brandon Nkawu' },
            website: { type: 'string', example: 'https://www.acme.com' },
            logo: { type: 'string', example: 'https://www.acme.com/logo.png' },
            orgref: { type: 'string', example: 'ORG123456' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean', example: false },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'Cape Town' },
                state: { type: 'string', example: 'Western Cape' },
                postalCode: { type: 'string', example: '8001' },
                country: { type: 'string', example: 'South Africa' },
                latitude: { type: 'number', example: -33.9249 },
                longitude: { type: 'number', example: 18.4241 }
              }
            },
            branches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  uid: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Main Branch' }
                }
              }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  findOne(@Param('ref') ref: string) {
    return this.organisationService.findOne(ref);
  }

  @Patch(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Update an organisation by reference code',
    description: 'Updates a specific organisation by its reference code. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Organisation reference code',
    type: 'string',
    example: 'ORG123456'
  })
  @ApiBody({ type: UpdateOrganisationDto })
  @ApiOkResponse({ 
    description: 'Organisation updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data provided' })
  update(@Param('ref') ref: string, @Body() updateOrganisationDto: UpdateOrganisationDto) {
    return this.organisationService.update(ref, updateOrganisationDto);
  }

  @Patch('restore/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Restore a deleted organisation by reference code',
    description: 'Restores a previously deleted organisation. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Organisation reference code',
    type: 'string',
    example: 'ORG123456'
  })
  @ApiOkResponse({ 
    description: 'Organisation restored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  restore(@Param('ref') ref: string) {
    return this.organisationService.restore(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Soft delete an organisation by reference code',
    description: 'Performs a soft delete on an organisation. Requires ADMIN, MANAGER, SUPPORT, or DEVELOPER role.'
  })
  @ApiParam({ 
    name: 'ref', 
    description: 'Organisation reference code',
    type: 'string',
    example: 'ORG123456'
  })
  @ApiOkResponse({ 
    description: 'Organisation deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  remove(@Param('ref') ref: string) {
    return this.organisationService.remove(ref);
  }
}
