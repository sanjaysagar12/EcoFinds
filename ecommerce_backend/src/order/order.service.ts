import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

export interface OrderFilters {
  status?: string;
  buyerId?: string;
  sellerId?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(buyerId: string, createOrderDto: CreateOrderDto) {
    const { items, shippingInfo } = createOrderDto;

    try {
      // Validate all products exist and calculate total
      let totalAmount = new Decimal(0);
      const orderItemsData: any[] = [];

      for (const item of items) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { seller: true }
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (!product.isActive || !product.isApproved) {
          throw new BadRequestException(`Product ${product.title} is not available for purchase`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        const itemPrice = new Decimal(product.price.toString());
        const subtotal = itemPrice.mul(item.quantity);
        totalAmount = totalAmount.add(subtotal);

        orderItemsData.push({
          productId: item.productId,
          productName: product.title,
          price: product.price,
          quantity: item.quantity,
          subtotal: subtotal.toNumber(),
        });
      }

      // Create order with items in a transaction
      const order = await this.prisma.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            buyerId,
            total: totalAmount.toNumber(),
            shippingInfo,
            status: 'PENDING',
            items: {
              create: orderItemsData
            }
          },
          include: {
            items: {
              include: {
                product: {
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
                }
              }
            },
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        });

        // Update product stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        return newOrder;
      });

      return order;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create order. Please try again.');
    }
  }

  async getUserOrders(buyerId: string, filters: OrderFilters = {}, pagination: PaginationOptions) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      buyerId,
      ...(filters.status && { status: filters.status }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
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
              }
            }
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userId, // Ensure user can only access their own orders
      },
      include: {
        items: {
          include: {
            product: {
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
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: string, userId: string) {
    // Check if order exists and user owns it
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userId,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status as any,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      },
      include: {
        items: {
          include: {
            product: {
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
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return updatedOrder;
  }
}
