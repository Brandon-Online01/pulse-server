import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { 
  ApiOperation, 
  ApiTags, 
  ApiParam, 
  ApiBody, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse, 
  ApiUnauthorizedResponse 
} from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { Product } from '../products/entities/product.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { AccessLevel } from '../lib/enums/user.enums';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';
import { OrderStatus } from '../lib/enums/status.enums';

@ApiTags('shop')
@Controller('shop')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('shop')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials or missing token' })
export class ShopController {
  constructor(private readonly shopService: ShopService) { }

  //shopping
  @Get('best-sellers')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of best selling products',
    description: 'Retrieves a list of products that have the highest sales volume'
  })
  @ApiOkResponse({ 
    description: 'Best selling products retrieved successfully',
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
              imageUrl: { type: 'string' },
              salesCount: { type: 'number' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  getBestSellers() {
    return this.shopService.getBestSellers();
  }

  @Get('new-arrivals')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of newly arrived products',
    description: 'Retrieves a list of products that were recently added to the inventory'
  })
  @ApiOkResponse({ 
    description: 'New arrivals retrieved successfully',
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
              imageUrl: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  getNewArrivals() {
    return this.shopService.getNewArrivals();
  }

  @Get('hot-deals')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of products with hot deals',
    description: 'Retrieves a list of products that are currently on sale or have special promotions'
  })
  @ApiOkResponse({ 
    description: 'Hot deals retrieved successfully',
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
              originalPrice: { type: 'number' },
              salePrice: { type: 'number' },
              discountPercentage: { type: 'number' },
              imageUrl: { type: 'string' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  getHotDeals() {
    return this.shopService.getHotDeals();
  }

  @Get('categories')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of categories',
    description: 'Retrieves all product categories available in the shop'
  })
  @ApiOkResponse({ 
    description: 'Categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              productCount: { type: 'number' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  categories() {
    return this.shopService.categories();
  }

  @Get('specials')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of specials',
    description: 'Retrieves all special offers and promotions currently available'
  })
  @ApiOkResponse({ 
    description: 'Specials retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        specials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              discountPercentage: { type: 'number' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  specials() {
    return this.shopService.specials();
  }

  //ordering
  @Post('checkout')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Checkout a list of products',
    description: 'Creates a quotation for the selected products in the shopping cart'
  })
  @ApiBody({ type: CheckoutDto })
  @ApiCreatedResponse({ 
    description: 'Quotation created successfully',
    schema: {
      type: 'object',
      properties: {
        quotation: {
          type: 'object',
          properties: {
            uid: { type: 'number' },
            reference: { type: 'string' },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'number' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  subtotal: { type: 'number' }
                }
              }
            }
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
        message: { type: 'string', example: 'Error creating quotation' }
      }
    }
  })
  createQuotation(@Body() quotationData: CheckoutDto) {
    return this.shopService.createQuotation(quotationData);
  }

  @Get('quotations')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of all quotations',
    description: 'Retrieves all quotations created in the system'
  })
  @ApiOkResponse({ 
    description: 'Quotations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        quotations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number' },
              reference: { type: 'string' },
              totalAmount: { type: 'number' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  uid: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  getQuotations() {
    return this.shopService.getAllQuotations();
  }

  @Get('quotations/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a quotation by reference',
    description: 'Retrieves detailed information about a specific quotation'
  })
  @ApiParam({ name: 'ref', description: 'Quotation reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Quotation retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        quotation: {
          type: 'object',
          properties: {
            uid: { type: 'number' },
            reference: { type: 'string' },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    type: 'object',
                    properties: {
                      uid: { type: 'number' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'number' },
                      imageUrl: { type: 'string' }
                    }
                  },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  subtotal: { type: 'number' }
                }
              }
            },
            user: {
              type: 'object',
              properties: {
                uid: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Quotation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quotation not found' },
        quotation: { type: 'null' }
      }
    }
  })
  getQuotationByRef(@Param('ref') ref: number) {
    return this.shopService.getQuotationByRef(ref);
  }

  @Get('quotations/by/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of quotations owned by user',
    description: 'Retrieves all quotations created by a specific user'
  })
  @ApiParam({ name: 'ref', description: 'User reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'User quotations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        quotations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number' },
              reference: { type: 'string' },
              totalAmount: { type: 'number' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'User not found or has no quotations',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'No quotations found for this user' },
        quotations: { type: 'array', items: {}, example: [] }
      }
    }
  })
  getQuotationsByUser(@Param('ref') ref: number) {
    return this.shopService.getQuotationsByUser(ref);
  }

  @Patch('quotations/:ref/status')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Update quotation status',
    description: 'Updates the status of a quotation and triggers analytics updates'
  })
  @ApiParam({ name: 'ref', description: 'Quotation reference code or ID', type: 'number' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: Object.values(OrderStatus),
          description: 'New status for the quotation'
        }
      },
      required: ['status']
    }
  })
  @ApiOkResponse({ 
    description: 'Quotation status updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Quotation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quotation not found' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid status provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid status' }
      }
    }
  })
  async updateQuotationStatus(
    @Param('ref') ref: number,
    @Body('status') status: OrderStatus
  ) {
    await this.shopService.updateQuotationStatus(ref, status);
    return {
      message: process.env.SUCCESS_MESSAGE
    };
  }

  //shop banners
  @Get('banners')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Get a list of banners',
    description: 'Retrieves all banners configured for the shop'
  })
  @ApiOkResponse({ 
    description: 'Banners retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        banners: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' },
              imageUrl: { type: 'string' },
              linkUrl: { type: 'string' },
              isActive: { type: 'boolean' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' }
            }
          }
        },
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  getBanner() {
    return this.shopService.getBanner();
  }

  @Post('banners')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Create a banner',
    description: 'Creates a new banner for the shop'
  })
  @ApiBody({ type: CreateBannerDto })
  @ApiCreatedResponse({ 
    description: 'Banner created successfully',
    schema: {
      type: 'object',
      properties: {
        banner: {
          type: 'object',
          properties: {
            uid: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            imageUrl: { type: 'string' },
            linkUrl: { type: 'string' },
            isActive: { type: 'boolean' }
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
        message: { type: 'string', example: 'Error creating banner' }
      }
    }
  })
  createBanner(@Body() bannerData: CreateBannerDto) {
    return this.shopService.createBanner(bannerData);
  }

  @Patch('banners/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Update a banner',
    description: 'Updates an existing banner with the provided information'
  })
  @ApiParam({ name: 'ref', description: 'Banner reference code or ID', type: 'number' })
  @ApiBody({ type: UpdateBannerDto })
  @ApiOkResponse({ 
    description: 'Banner updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Banner not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Banner not found' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error updating banner' }
      }
    }
  })
  updateBanner(@Param('ref') ref: number, @Body() bannerData: UpdateBannerDto) {
    return this.shopService.updateBanner(ref, bannerData);
  }

  @Delete('banners/:ref')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ 
    summary: 'Delete a banner',
    description: 'Deletes a banner from the system'
  })
  @ApiParam({ name: 'ref', description: 'Banner reference code or ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Banner deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Success' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Banner not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Banner not found' }
      }
    }
  })
  deleteBanner(@Param('ref') ref: number) {
    return this.shopService.deleteBanner(ref);
  }

  @Post('generate-missing-skus')
  @UseGuards(AuthGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Generate missing SKUs for products',
    description: 'Generates SKUs for products that do not have them'
  })
  @ApiOkResponse({ 
    description: 'SKUs generated successfully',
    schema: {
      type: 'object',
      properties: {
        generatedCount: { type: 'number', example: 10 },
        message: { type: 'string', example: 'Successfully generated SKUs for products' }
      }
    }
  })
  async generateMissingSKUs() {
    return this.shopService.generateSKUsForExistingProducts();
  }

  @Post('regenerate-all-skus')
  @UseGuards(AuthGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ 
    summary: 'Regenerate all SKUs for products',
    description: 'Regenerates SKUs for all products in the system'
  })
  @ApiOkResponse({ 
    description: 'All SKUs regenerated successfully',
    schema: {
      type: 'object',
      properties: {
        regeneratedCount: { type: 'number', example: 50 },
        message: { type: 'string', example: 'Successfully regenerated all SKUs' }
      }
    }
  })
  async regenerateAllSKUs() {
    return this.shopService.regenerateAllSKUs();
  }
}
