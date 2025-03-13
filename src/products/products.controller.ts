import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiParam, 
  ApiBody, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse, 
  ApiUnauthorizedResponse,
  ApiQuery
} from '@nestjs/swagger';
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
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

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
    summary: 'Create a product',
    description: 'Creates a new product with the provided details'
  })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ 
    description: 'Product created successfully',
    schema: {
      type: 'object',
      properties: {
        product: {
          type: 'object',
          properties: {
            uid: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            sku: { type: 'string' }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error creating product' }
      }
    }
  })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
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
    summary: 'Get a list of products',
    description: 'Retrieves a paginated list of products'
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number, defaults to 1' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of records per page, defaults to system setting' })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              sku: { type: 'string' },
              imageUrl: { type: 'string' },
              category: { type: 'string' },
              isActive: { type: 'boolean' }
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  products(@Query() query: PaginationQuery) {
    return this.productsService.products(query.page, query.limit);
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
    summary: 'Get a product by reference code',
    description: 'Retrieves detailed information about a specific product'
  })
  @ApiParam({ name: 'ref', description: 'Product reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Product retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        product: {
          type: 'object',
          properties: {
            uid: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            sku: { type: 'string' },
            imageUrl: { type: 'string' },
            category: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' },
        product: { type: 'null' }
      }
    }
  })
  getProductByref(@Param('ref') ref: number) {
    return this.productsService.getProductByref(ref);
  }

  @Get('category/:category')
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
    summary: 'Get a list of products by category',
    description: 'Retrieves a list of products that belong to a specific category'
  })
  @ApiParam({ name: 'category', description: 'Category name or ID', type: 'string' })
  @ApiOkResponse({ 
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              sku: { type: 'string' },
              imageUrl: { type: 'string' },
              category: { type: 'string' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'No products found in this category',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'No products found in this category' },
        products: { type: 'array', items: {}, example: [] }
      }
    }
  })
  productsBySearchTerm(@Param('category') category: string) {
    return this.productsService.productsBySearchTerm(category);
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
    summary: 'Update a product',
    description: 'Updates an existing product with the provided information'
  })
  @ApiParam({ name: 'ref', description: 'Product reference code or ID', type: 'number' })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ 
    description: 'Product updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error updating product' }
      }
    }
  })
  updateProduct(
    @Param('ref') ref: number,
    @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(ref, updateProductDto);
  }

  @Patch('restore/:ref')
  @ApiOperation({ 
    summary: 'Restore a deleted product',
    description: 'Restores a previously deleted product'
  })
  @ApiParam({ name: 'ref', description: 'Product reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Product restored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
 @Roles(
		AccessLevel.ADMIN,
		AccessLevel.MANAGER,
		AccessLevel.SUPPORT,
		AccessLevel.DEVELOPER,
		AccessLevel.USER,
		AccessLevel.OWNER,
		AccessLevel.TECHNICIAN,
	)
  restoreProduct(@Param('ref') ref: number) {
    return this.productsService.restoreProduct(ref);
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
    summary: 'Soft delete a product',
    description: 'Marks a product as deleted without removing it from the database'
  })
  @ApiParam({ name: 'ref', description: 'Product reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  deleteProduct(@Param('ref') ref: number) {
    return this.productsService.deleteProduct(ref);
  }

  @Get(':id/analytics')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Get product analytics',
    description: 'Retrieves analytics data for a specific product'
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Product analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        analytics: {
          type: 'object',
          properties: {
            views: { type: 'number' },
            cartAdds: { type: 'number' },
            wishlistAdds: { type: 'number' },
            purchases: { type: 'number' },
            conversionRate: { type: 'number' },
            performance: { type: 'number' }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  async getProductAnalytics(@Param('id') id: number) {
    return this.productsService.getProductAnalytics(id);
  }

  @Post(':id/analytics')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Update product analytics',
    description: 'Updates analytics data for a specific product'
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiBody({ type: ProductAnalyticsDto })
  @ApiOkResponse({ 
    description: 'Product analytics updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error updating product analytics' }
      }
    }
  })
  async updateProductAnalytics(
    @Param('id') id: number,
    @Body() analyticsDto: ProductAnalyticsDto
  ) {
    return this.productsService.updateProductAnalytics(id, analyticsDto);
  }

  @Post(':id/record-view')
  @ApiOperation({ 
    summary: 'Record product view',
    description: 'Increments the view count for a specific product'
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Product view recorded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  async recordProductView(@Param('id') id: number) {
    return this.productsService.recordView(id);
  }

  @Post(':id/record-cart-add')
  @ApiOperation({ 
    summary: 'Record cart add',
    description: 'Increments the cart add count for a specific product'
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Cart add recorded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  async recordCartAdd(@Param('id') id: number) {
    return this.productsService.recordCartAdd(id);
  }

  @Post(':id/record-wishlist')
  @ApiOperation({ 
    summary: 'Record wishlist add',
    description: 'Increments the wishlist add count for a specific product'
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Wishlist add recorded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  async recordWishlist(@Param('id') id: number) {
    return this.productsService.recordWishlist(id);
  }

  @Post(':id/calculate-performance')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Calculate product performance',
    description: 'Calculates performance metrics for a specific product based on analytics data'
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Product performance calculated successfully',
    schema: {
      type: 'object',
      properties: {
        performance: { type: 'number' },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' }
      }
    }
  })
  async calculatePerformance(@Param('id') id: number) {
    return this.productsService.calculateProductPerformance(id);
  }
}
