import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { Product } from '../products/entities/product.entity';
import { CheckoutDto, OrderItemDto } from './dto/checkout.dto';
import { AccessLevel } from '../lib/enums/user.enums';

@ApiTags('shop')
@Controller('shop')
@UseGuards(AuthGuard, RoleGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) { }

  @Get('banners')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of banners' })
  getBanners() {
    return this.shopService.getBanners();
  }

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
}
