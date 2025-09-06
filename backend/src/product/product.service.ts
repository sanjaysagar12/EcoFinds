import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  isActive?: boolean;
  search?: string;
  condition?: string;
  brand?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  title: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  yearOfManufacture?: number;
  brand?: string;
  model?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  weight?: number;
  material?: string;
  color?: string;
  originalPackaging?: boolean;
  manualIncluded?: boolean;
  workingConditionDesc?: string;
  thumbnail?: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
  sellerId: string;
}

export interface UpdateProductData {
  title?: string;
  category?: string;
  description?: string;
  price?: number;
  quantity?: number;
  condition?: string;
  yearOfManufacture?: number;
  brand?: string;
  model?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  weight?: number;
  material?: string;
  color?: string;
  originalPackaging?: boolean;
  manualIncluded?: boolean;
  workingConditionDesc?: string;
  thumbnail?: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
}

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(productData: CreateProductData) {
    return await this.prisma.product.create({
      data: {
        title: productData.title,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity,
        condition: productData.condition,
        yearOfManufacture: productData.yearOfManufacture,
        brand: productData.brand,
        model: productData.model,
        dimensionLength: productData.dimensionLength,
        dimensionWidth: productData.dimensionWidth,
        dimensionHeight: productData.dimensionHeight,
        weight: productData.weight,
        material: productData.material,
        color: productData.color,
        originalPackaging: productData.originalPackaging ?? false,
        manualIncluded: productData.manualIncluded ?? false,
        workingConditionDesc: productData.workingConditionDesc,
        thumbnail: productData.thumbnail,
        images: productData.images || [],
        stock: productData.stock ?? 0,
        isActive: productData.isActive ?? true,
        sellerId: productData.sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });
  }

  async updateProduct(productId: string, sellerId: string, updateData: UpdateProductData) {
    // First check if the product exists and belongs to the seller
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: sellerId
      }
    });

    if (!existingProduct) {
      throw new Error('Product not found or you are not authorized to update this product');
    }

    return await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });
  }

  async deleteProduct(productId: string, sellerId: string) {
    // First check if the product exists and belongs to the seller
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: sellerId
      }
    });

    if (!existingProduct) {
      throw new Error('Product not found or you are not authorized to delete this product');
    }

    return await this.prisma.product.delete({
      where: { id: productId }
    });
  }

  async getAllProducts(filters: ProductFilters = {}, pagination: PaginationOptions = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    
    const where: any = {
      isActive: filters.isActive ?? true,
      isApproved: true,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where })
    ]);

    const productsWithAvgRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0,
      reviewCount: product.reviews.length,
      reviews: undefined // Remove reviews array from response
    }));

    return {
      products: productsWithAvgRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}
