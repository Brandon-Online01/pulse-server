import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AccessLevel } from '../lib/enums/user.enums';
import { ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/role.decorator';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQuery } from '../lib/interfaces/product.interfaces';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
@ApiTags('products')
@Controller('products')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a product' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products i.e /products?page=1&limit=10' })
  products(@Query() query: PaginationQuery) {
    return this.productsService.products(query.page, query.limit);
  }

  @Get(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a product by reference code' })
  getProductByref(@Param('ref') ref: number) {
    return this.productsService.getProductByref(ref);
  }

  @Get('category/:category')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a list of products by category i.e products/category/specials?page=1&limit=10' })
  productsBySearchTerm(@Param('category') category: string) {
    return this.productsService.productsBySearchTerm(category);
  }

  @Patch(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a product' })
  updateProduct(
    @Param('ref') ref: number,
    @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(ref, updateProductDto);
  }

  @Patch('restore/:ref')
  @ApiOperation({ summary: 'Restore a deleted product by reference code' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  restoreProduct(@Param('ref') ref: number) {
    return this.productsService.restoreProduct(ref);
  }

  @Delete(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a product' })
  deleteProduct(@Param('ref') ref: number) {
    return this.productsService.deleteProduct(ref);
  }
}
