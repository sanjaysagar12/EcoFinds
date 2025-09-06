import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {}

    async getCart(userId: string) {
        try {
            // Get or create cart for the user
            let cart = await this.prisma.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    price: true,
                                    thumbnail: true,
                                    stock: true,
                                    isActive: true,
                                    seller: {
                                        select: {
                                            id: true,
                                            name: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!cart) {
                // Create cart if it doesn't exist
                cart = await this.prisma.cart.create({
                    data: { userId },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        title: true,
                                        price: true,
                                        thumbnail: true,
                                        stock: true,
                                        isActive: true,
                                        seller: {
                                            select: {
                                                id: true,
                                                name: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Calculate totals
            const total = cart.items.reduce((sum, item) => {
                return sum + (parseFloat(item.product.price.toString()) * item.quantity);
            }, 0);

            const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

            return {
                id: cart.id,
                items: cart.items.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    product: {
                        ...item.product,
                        price: parseFloat(item.product.price.toString())
                    },
                    subtotal: parseFloat(item.product.price.toString()) * item.quantity
                })),
                total,
                count,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            };
        } catch (error) {
            throw new BadRequestException('Failed to fetch cart');
        }
    }

    async addToCart(userId: string, addToCartDto: AddToCartDto) {
        try {
            const { productId, quantity = 1 } = addToCartDto;

            // Verify product exists and is active
            const product = await this.prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                throw new NotFoundException('Product not found');
            }

            if (!product.isActive) {
                throw new BadRequestException('Product is not available');
            }

            if (product.stock < quantity) {
                throw new BadRequestException('Insufficient stock');
            }

            // Prevent users from adding their own products to cart
            if (product.sellerId === userId) {
                throw new BadRequestException('You cannot add your own products to cart');
            }

            // Get or create cart
            let cart = await this.prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: { userId }
                });
            }

            // Check if item already exists in cart
            const existingCartItem = await this.prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: productId
                    }
                }
            });

            let cartItem;

            if (existingCartItem) {
                // Update quantity if item exists
                const newQuantity = existingCartItem.quantity + quantity;
                
                if (newQuantity > product.stock) {
                    throw new BadRequestException('Insufficient stock for requested quantity');
                }

                cartItem = await this.prisma.cartItem.update({
                    where: { id: existingCartItem.id },
                    data: { quantity: newQuantity },
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                                thumbnail: true,
                                stock: true
                            }
                        }
                    }
                });
            } else {
                // Create new cart item
                cartItem = await this.prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: productId,
                        quantity: quantity
                    },
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                                thumbnail: true,
                                stock: true
                            }
                        }
                    }
                });
            }

            return {
                id: cartItem.id,
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                product: {
                    ...cartItem.product,
                    price: parseFloat(cartItem.product.price.toString())
                },
                subtotal: parseFloat(cartItem.product.price.toString()) * cartItem.quantity,
                createdAt: cartItem.createdAt,
                updatedAt: cartItem.updatedAt
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to add item to cart');
        }
    }

    async updateCartItem(userId: string, cartItemId: string, updateCartDto: UpdateCartDto) {
        try {
            const { quantity } = updateCartDto;

            // Find cart item and verify ownership
            const cartItem = await this.prisma.cartItem.findUnique({
                where: { id: cartItemId },
                include: {
                    cart: true,
                    product: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            stock: true,
                            isActive: true
                        }
                    }
                }
            });

            if (!cartItem) {
                throw new NotFoundException('Cart item not found');
            }

            if (cartItem.cart.userId !== userId) {
                throw new BadRequestException('You can only update your own cart items');
            }

            if (!cartItem.product.isActive) {
                throw new BadRequestException('Product is no longer available');
            }

            if (quantity && quantity > cartItem.product.stock) {
                throw new BadRequestException('Insufficient stock');
            }

            const updatedCartItem = await this.prisma.cartItem.update({
                where: { id: cartItemId },
                data: { quantity },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            thumbnail: true,
                            stock: true
                        }
                    }
                }
            });

            return {
                id: updatedCartItem.id,
                productId: updatedCartItem.productId,
                quantity: updatedCartItem.quantity,
                product: {
                    ...updatedCartItem.product,
                    price: parseFloat(updatedCartItem.product.price.toString())
                },
                subtotal: parseFloat(updatedCartItem.product.price.toString()) * updatedCartItem.quantity,
                createdAt: updatedCartItem.createdAt,
                updatedAt: updatedCartItem.updatedAt
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to update cart item');
        }
    }

    async removeFromCart(userId: string, cartItemId: string) {
        try {
            // Find cart item and verify ownership
            const cartItem = await this.prisma.cartItem.findUnique({
                where: { id: cartItemId },
                include: {
                    cart: true
                }
            });

            if (!cartItem) {
                throw new NotFoundException('Cart item not found');
            }

            if (cartItem.cart.userId !== userId) {
                throw new BadRequestException('You can only remove your own cart items');
            }

            await this.prisma.cartItem.delete({
                where: { id: cartItemId }
            });

            return { message: 'Item removed from cart successfully' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to remove item from cart');
        }
    }

    async clearCart(userId: string) {
        try {
            const cart = await this.prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                throw new NotFoundException('Cart not found');
            }

            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            return { message: 'Cart cleared successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to clear cart');
        }
    }
}
