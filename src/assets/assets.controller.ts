import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/enums';
import { Roles } from '../decorators/role.decorator';

@ApiTags('assets')
@Controller('assets')
@UseGuards(RoleGuard, AuthGuard)
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService
  ) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a new asset' })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all assets' })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get an asset by reference code' })
  findOne(@Param('referenceCode') referenceCode: number) {
    return this.assetsService.findOne(referenceCode);
  }

  @Get('/search/:queryTerm')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get an asset by search term i.e brand, model number, serial number' })
  findByBrand(@Param('queryTerm') queryTerm: string) {
    return this.assetsService.findByBrand(queryTerm);
  }

  @Patch(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update an asset' })
  update(@Param('referenceCode') referenceCode: number, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(referenceCode, updateAssetDto);
  }

  @Patch('restore/:referenceCode')
  @ApiOperation({ summary: 'Restore a deleted user by reference code' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restore(@Param('referenceCode') referenceCode: number) {
    return this.assetsService.restore(referenceCode);
  }

  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete asset' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.assetsService.remove(referenceCode);
  }
}
