import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { Product } from '../products/entities/product.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { AccessLevel } from '../lib/enums/user.enums';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';

@ApiTags('shop')
@Controller('shop')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) { }

  //shopping
  @Get('best-sellers')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of best selling products' })
  getBestSellers() {
    return this.shopService.getBestSellers();
  }

  @Get('new-arrivals')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of newly arrived products' })
  getNewArrivals() {
    return this.shopService.getNewArrivals();
  }

  @Get('hot-deals')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products with hot deals' })
  getHotDeals() {
    return this.shopService.getHotDeals();
  }

  @Get('categories')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of categories' })
  categories() {
    return this.shopService.categories();
  }

  @Get('specials')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of specials' })
  specials() {
    return this.shopService.specials();
  }

  //ordering
  @Post('checkout')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'checkout a list of products' })
  checkout(@Body() items: CheckoutDto) {
    return this.shopService.checkout(items);
  }

  @Get('quotations')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of all quotations' })
  getQuotations() {
    return this.shopService.getAllQuotations();
  }

  @Get('quotations/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get an quotations by reference' })
  getQuotationByRef(@Param('ref') ref: number) {
    return this.shopService.getQuotationByRef(ref);
  }

  @Get('quotations/by/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of quotations owned by user' })
  getQuotationsByUser(@Param('ref') ref: number) {
    return this.shopService.getQuotationsByUser(ref);
  }

  //shop banners
  @Get('banners')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of banners' })
  getBanner() {
    return this.shopService.getBanner();
  }

  @Post('banners')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a banner' })
  createBanner(@Body() bannerData: CreateBannerDto) {
    return this.shopService.createBanner(bannerData);
  }

  @Patch('banners/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a banner' })
  updateBanner(@Param('ref') ref: number, @Body() bannerData: UpdateBannerDto) {
    return this.shopService.updateBanner(ref, bannerData);
  }

  @Delete('banners/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'delete a banner' })
  deleteBanner(@Param('ref') ref: number) {
    return this.shopService.deleteBanner(ref);
  }

  @Post('generate-missing-skus')
  @UseGuards(AuthGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'generate missing SKUs for products' })
  async generateMissingSKUs() {
    return this.shopService.generateSKUsForExistingProducts();
  }

  @Post('regenerate-all-skus')
  @UseGuards(AuthGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'regenerate all SKUs for products' })
  async regenerateAllSKUs() {
    return this.shopService.regenerateAllSKUs();
  }
}
