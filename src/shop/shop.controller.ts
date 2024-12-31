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

@ApiTags('shop')
@Controller('shop')
@UseGuards(AuthGuard, RoleGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) { }

  //shopping
  @Get('best-sellers')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of best selling products' })
  getBestSellers() {
    return this.shopService.getBestSellers();
  }

  @Get('new-arrivals')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of newly arrived products' })
  getNewArrivals() {
    return this.shopService.getNewArrivals();
  }

  @Get('hot-deals')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products with hot deals' })
  getHotDeals() {
    return this.shopService.getHotDeals();
  }

  @Get('categories')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of categories' })
  categories() {
    return this.shopService.categories();
  }

  @Get('specials')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of specials' })
  specials() {
    return this.shopService.specials();
  }

  //ordering
  @Post('checkout')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'checkout a list of products' })
  checkout(@Body() items: CheckoutDto) {
    return this.shopService.checkout(items);
  }

  @Get('orders')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of all orders' })
  getOrders() {
    return this.shopService.getAllOrders();
  }

  @Get('order/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get an order by reference' })
  getOrderByRef(@Param('ref') ref: number) {
    return this.shopService.getOrderByRef(ref);
  }

  @Get('orders/by/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of orders owned by user' })
  getOrdersByUser(@Param('ref') ref: number) {
    return this.shopService.getOrdersByUser(ref);
  }

  //shop banners
  @Get('banners')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of banners' })
  getBanner() {
    return this.shopService.getBanner();
  }

  @Post('banners')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a banner' })
  createBanner(@Body() bannerData: CreateBannerDto) {
    return this.shopService.createBanner(bannerData);
  }

  @Patch('banners/:uid')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a banner' })
  updateBanner(@Param('uid') uid: number, @Body() bannerData: UpdateBannerDto) {
    return this.shopService.updateBanner(uid, bannerData);
  }

  @Delete('banners/:uid')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'delete a banner' })
  deleteBanner(@Param('uid') uid: number) {
    return this.shopService.deleteBanner(uid);
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
