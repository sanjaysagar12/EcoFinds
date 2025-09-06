import { Body, Controller, Get, Post, Put, Delete, Query, UseGuards, Logger, Param } from '@nestjs/common';
import { ProductService, ProductFilters, PaginationOptions } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtGuard } from 'src/application/common/guards/jwt.guard';
import { RolesGuard } from 'src/application/common/guards/roles.guard';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';

@Controller('api/products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @GetUser('sub') userId: string,
  ) {
    this.logger.log(`User ${userId} creating a new product: ${createProductDto.title}`);
    
    const productData = {
      ...createProductDto,
      sellerId: userId,
    };
    
    const product = await this.productService.createProduct(productData);
    
    return {
      status: 'success',
      message: 'Product created successfully',
      data: product,
    };
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async updateProduct(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser('sub') userId: string,
  ) {
    this.logger.log(`User ${userId} updating product: ${productId}`);
    
    try {
      const product = await this.productService.updateProduct(productId, userId, updateProductDto);
      
      return {
        status: 'success',
        message: 'Product updated successfully',
        data: product,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async deleteProduct(
    @Param('id') productId: string,
    @GetUser('sub') userId: string,
  ) {
    this.logger.log(`User ${userId} deleting product: ${productId}`);
    
    try {
      await this.productService.deleteProduct(productId, userId);
      
      return {
        status: 'success',
        message: 'Product deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get(':id')
  async getProductById(@Param('id') productId: string) {
    this.logger.log(`Fetching product: ${productId}`);
    
    try {
      const product = await this.productService.getProductById(productId);
      
      return {
        status: 'success',
        message: 'Product retrieved successfully',
        data: product,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get()
  async getAllProducts(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sellerId') sellerId?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('condition') condition?: string,
    @Query('brand') brand?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: ProductFilters = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sellerId,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
      condition,
      brand,
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    return this.productService.getAllProducts(filters, pagination);
  }

  // Get products listed by the current authenticated user
  @Get('my-products')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async getMyProducts(
    @GetUser('sub') userId: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('condition') condition?: string,
    @Query('brand') brand?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log(`User ${userId} fetching their own products`);
    
    const filters: ProductFilters = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sellerId: userId, // Force sellerId to be the current user
      isActive: isActive ? isActive === 'true' : undefined,
      search,
      condition,
      brand,
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    try {
      const result = await this.productService.getAllProducts(filters, pagination);
      
      return {
        status: 'success',
        message: 'Your products retrieved successfully',
        products: result.products,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get products listed by any specific user (public endpoint)
  @Get('by-user/:userId')
  async getProductsByUser(
    @Param('userId') userId: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('condition') condition?: string,
    @Query('brand') brand?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log(`Fetching products listed by user ${userId}`);
    
    const filters: ProductFilters = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sellerId: userId, // Filter by the specified user ID
      isActive: true, // Only show active products for public viewing
      search,
      condition,
      brand,
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    try {
      const result = await this.productService.getAllProducts(filters, pagination);
      
      return {
        status: 'success',
        message: 'Products retrieved successfully',
        products: result.products,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
