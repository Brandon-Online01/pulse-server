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
@UseGuards(RoleGuard, AuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) { }

  @Get('clients')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of shops one can buy for' })
  availableBuyers() {
    return this.shopService.availableBuyers();
  }

  @Get('highlights')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of banner highlights' })
  bannerHighlights() {
    return this.shopService.bannerHighlights();
  }

  //orders
  @Get('orders')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of orders' })
  orders() {
    return this.shopService.orders();
  }

  //products
  @Post('products')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a product' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.shopService.createProduct(createProductDto);
  }

  @Patch('products/:referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a product' })
  updateProduct(
    @Param('referenceCode') referenceCode: number,
    @Body() updateProductDto: UpdateProductDto) {
    return this.shopService.updateProduct(referenceCode, updateProductDto);
  }

  @Delete('products/:referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a product' })
  deleteProduct(@Param('referenceCode') referenceCode: number) {
    return this.shopService.deleteProduct(referenceCode);
  }

  @Patch('restore/products/:referenceCode')
  @ApiOperation({ summary: 'Restore a deleted product by reference code' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restoreProduct(@Param('referenceCode') referenceCode: number) {
    return this.shopService.restoreProduct(referenceCode);
  }

  @Get('products')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products' })
  products() {
    return this.shopService.products();
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

  @Get('products/:referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a product by reference code' })
  getProductByReferenceCode(@Param('referenceCode') referenceCode: number) {
    return this.shopService.getProductByReferenceCode(referenceCode);
  }
}
