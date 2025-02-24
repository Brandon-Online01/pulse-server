import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/role.decorator';
import { ProductsService } from './products.service';
import { AccessLevel } from '../lib/enums/user.enums';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQuery } from '../lib/interfaces/product.interfaces';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductAnalyticsDto } from './dto/product-analytics.dto';

@ApiTags('products')
@Controller('products')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a product' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products i.e /products?page=1&limit=10' })
  products(@Query() query: PaginationQuery) {
    return this.productsService.products(query.page, query.limit);
  }

  @Get(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a product by reference code' })
  getProductByref(@Param('ref') ref: number) {
    return this.productsService.getProductByref(ref);
  }

  @Get('category/:category')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products by category i.e products/category/specials?page=1&limit=10' })
  productsBySearchTerm(@Param('category') category: string) {
    return this.productsService.productsBySearchTerm(category);
  }

  @Patch(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a product' })
  updateProduct(
    @Param('ref') ref: number,
    @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(ref, updateProductDto);
  }

  @Patch('restore/:ref')
  @ApiOperation({ summary: 'Restore a deleted product by reference code' })
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restoreProduct(@Param('ref') ref: number) {
    return this.productsService.restoreProduct(ref);
  }

  @Delete(':ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a product' })
  deleteProduct(@Param('ref') ref: number) {
    return this.productsService.deleteProduct(ref);
  }

  @Get(':id/analytics')
  async getProductAnalytics(@Param('id') id: number) {
    return this.productsService.getProductAnalytics(id);
  }

  @Post(':id/analytics')
  async updateProductAnalytics(
    @Param('id') id: number,
    @Body() analyticsDto: ProductAnalyticsDto
  ) {
    return this.productsService.updateProductAnalytics(id, analyticsDto);
  }

  @Post(':id/record-view')
  async recordProductView(@Param('id') id: number) {
    return this.productsService.recordView(id);
  }

  @Post(':id/record-cart-add')
  async recordCartAdd(@Param('id') id: number) {
    return this.productsService.recordCartAdd(id);
  }

  @Post(':id/record-wishlist')
  async recordWishlist(@Param('id') id: number) {
    return this.productsService.recordWishlist(id);
  }

  @Post(':id/calculate-performance')
  async calculatePerformance(@Param('id') id: number) {
    return this.productsService.calculateProductPerformance(id);
  }
}
