import { Controller, Get, Post, Put, Delete, Body, Param, Logger, UseGuards, HttpStatus } from '@nestjs/common';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { JwtGuard } from '../application/common/guards/jwt.guard';
import { RolesGuard } from '../application/common/guards/roles.guard';
import { CartService } from './cart.service';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';
import { AddToCartDto, UpdateCartDto } from './dto';

@Controller("api/cart")
@UseGuards(JwtGuard, RolesGuard)
export class CartController {
    private readonly logger = new Logger(CartController.name);

    constructor(private readonly cartService: CartService) {}

    @Get()
    @Roles(Role.USER, Role.ADMIN)
    async getCart(@GetUser('sub') userId: string) {
        this.logger.log(`User ${userId} requested cart items`);
        const data = await this.cartService.getCart(userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Cart fetched successfully',
            data: data,
        };
    }

    @Post()
    @Roles(Role.USER, Role.ADMIN)
    async addToCart(
        @Body() addToCartDto: AddToCartDto,
        @GetUser('sub') userId: string
    ) {
        this.logger.log(`User ${userId} adding item to cart`);
        const cartItem = await this.cartService.addToCart(userId, addToCartDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Item added to cart successfully',
            data: cartItem
        };
    }

    @Put(':id')
    @Roles(Role.USER, Role.ADMIN)
    async updateCartItem(
        @Param('id') cartItemId: string,
        @Body() updateCartDto: UpdateCartDto,
        @GetUser('sub') userId: string
    ) {
        this.logger.log(`User ${userId} updating cart item ${cartItemId}`);
        const updatedItem = await this.cartService.updateCartItem(userId, cartItemId, updateCartDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Cart item updated successfully',
            data: updatedItem
        };
    }

    @Delete(':id')
    @Roles(Role.USER, Role.ADMIN)
    async removeFromCart(
        @Param('id') cartItemId: string,
        @GetUser('sub') userId: string
    ) {
        this.logger.log(`User ${userId} removing cart item ${cartItemId}`);
        await this.cartService.removeFromCart(userId, cartItemId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Item removed from cart successfully'
        };
    }
}
