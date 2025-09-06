import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  isActive?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  image?: string;
  price: number;
  stock: number;
  category?: string;
  isActive?: boolean;
  sellerId: string;
}

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(productData: CreateProductData) {
    return await this.prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        image: productData.image,
        price: productData.price,
        stock: productData.stock,
        category: productData.category,
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
