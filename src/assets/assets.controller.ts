import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiParam, 
  ApiBody, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse,
  ApiUnauthorizedResponse 
} from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { Asset } from './entities/asset.entity';

@ApiBearerAuth('JWT-auth')
@ApiTags('assets')
@Controller('assets')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('assets')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService
  ) { }

  @Post()
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Create a new asset',
    description: 'Creates a new asset with the provided details'
  })
  @ApiBody({ type: CreateAssetDto })
  @ApiCreatedResponse({ 
    description: 'Asset created successfully',
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
        message: { type: 'string', example: 'Error creating asset' }
      }
    }
  })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Get all assets',
    description: 'Retrieves a list of all non-deleted assets'
  })
  @ApiOkResponse({
    description: 'Assets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        assets: {
          type: 'array',
          items: { 
            type: 'object',
            properties: {
              uid: { type: 'number' },
              name: { type: 'string' },
              // Other asset properties
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Get an asset by reference code',
    description: 'Retrieves detailed information about a specific asset'
  })
  @ApiParam({ name: 'ref', description: 'Asset reference code', type: 'number' })
  @ApiOkResponse({ 
    description: 'Asset details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        asset: { 
          type: 'object',
          properties: {
            uid: { type: 'number' },
            name: { type: 'string' },
            // Other asset properties
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Asset not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Asset not found' },
        asset: { type: 'null' }
      }
    }
  })
  findOne(@Param('ref') ref: number) {
    return this.assetsService.findOne(ref);
  }

  @Get('/search/:query')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Get assets by search term',
    description: 'Searches for assets by brand, model number, or serial number'
  })
  @ApiParam({ name: 'query', description: 'Search term (brand, model number, serial number)', type: 'string' })
  @ApiOkResponse({ 
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        assets: {
          type: 'array',
          items: { 
            type: 'object',
            properties: {
              uid: { type: 'number' },
              name: { type: 'string' },
              // Other asset properties
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  findBySearchTerm(@Param('query') query: string) {
    return this.assetsService.findBySearchTerm(query);
  }

  @Get('for/:ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Get assets by user',
    description: 'Retrieves all assets assigned to a specific user'
  })
  @ApiParam({ name: 'ref', description: 'User reference code', type: 'number' })
  @ApiOkResponse({ 
    description: 'User assets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        assets: {
          type: 'array',
          items: { 
            type: 'object',
            properties: {
              uid: { type: 'number' },
              name: { type: 'string' },
              // Other asset properties
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  assetsByUser(@Param('ref') ref: number) {
    return this.assetsService.assetsByUser(ref);
  }

  @Patch(':ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Update an asset',
    description: 'Updates an existing asset with the provided information'
  })
  @ApiParam({ name: 'ref', description: 'Asset reference code', type: 'number' })
  @ApiBody({ type: UpdateAssetDto })
  @ApiOkResponse({ 
    description: 'Asset updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Asset not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Asset not found' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error updating asset' }
      }
    }
  })
  update(@Param('ref') ref: number, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(ref, updateAssetDto);
  }

  @Patch('restore/:ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Restore a deleted asset',
    description: 'Restores a previously deleted asset'
  })
  @ApiParam({ name: 'ref', description: 'Asset reference code', type: 'number' })
  @ApiOkResponse({ 
    description: 'Asset restored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Asset not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Asset not found' }
      }
    }
  })
  restore(@Param('ref') ref: number) {
    return this.assetsService.restore(ref);
  }

  @Delete(':ref')
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  @ApiOperation({ 
    summary: 'Soft delete an asset',
    description: 'Marks an asset as deleted without removing it from the database'
  })
  @ApiParam({ name: 'ref', description: 'Asset reference code', type: 'number' })
  @ApiOkResponse({ 
    description: 'Asset deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Asset not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error deleting asset' }
      }
    }
  })
  remove(@Param('ref') ref: number) {
    return this.assetsService.remove(ref);
  }
}
