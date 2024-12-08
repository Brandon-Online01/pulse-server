import { Controller, UseGuards, Get, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { AccessLevel } from 'src/lib/enums/enums';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-shop.dto';

@ApiTags('shop')
@Controller('shop')
@UseGuards(AuthGuard, RoleGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) { }

  @Get('clients')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of shops one can buy for' })
  availableBuyers() {
    return this.shopService.availableBuyers();
  }

  @Get('highlights')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of banner highlights' })
  bannerHighlights() {
    return this.shopService.bannerHighlights();
  }

  //orders
  @Get('orders')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of orders' })
  orders() {
    return this.shopService.orders();
  }

  //products
  @Post('products')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a product' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.shopService.createProduct(createProductDto);
  }

  @Patch('products/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a product' })
  updateProduct(
    @Param('ref') ref: number,
    @Body() updateProductDto: UpdateProductDto) {
    return this.shopService.updateProduct(ref, updateProductDto);
  }

  @Delete('products/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a product' })
  deleteProduct(@Param('ref') ref: number) {
    return this.shopService.deleteProduct(ref);
  }

  @Patch('restore/products/:ref')
  @ApiOperation({ summary: 'Restore a deleted product by reference code' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restoreProduct(@Param('ref') ref: number) {
    return this.shopService.restoreProduct(ref);
  }

  @Get('products')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products' })
  products() {
    return this.shopService.products();
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

  @Get('products/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a product by reference code' })
  getProductByref(@Param('ref') ref: number) {
    return this.shopService.getProductByref(ref);
  }
}
