import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';

@ApiTags('assets')
@Controller('assets')
@UseGuards(AuthGuard, RoleGuard)
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService
  ) { }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a new asset' })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all assets' })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get an asset by reference code' })
  findOne(@Param('ref') ref: number) {
    return this.assetsService.findOne(ref);
  }

  @Get('/search/:query')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get an asset by search term i.e brand, model number, serial number' })
  findBySearchTerm(@Param('query') query: string) {
    return this.assetsService.findBySearchTerm(query);
  }

  @Get('for/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get assets by user reference code' })
  assetsByUser(@Param('ref') ref: number) {
    return this.assetsService.assetsByUser(ref);
  }

  @Patch(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update an asset' })
  update(@Param('ref') ref: number, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(ref, updateAssetDto);
  }

  @Patch('restore/:ref')
  @ApiOperation({ summary: 'Restore a deleted user by reference code' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restore(@Param('ref') ref: number) {
    return this.assetsService.restore(ref);
  }

  @Delete(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete asset' })
  remove(@Param('ref') ref: number) {
    return this.assetsService.remove(ref);
  }
}
