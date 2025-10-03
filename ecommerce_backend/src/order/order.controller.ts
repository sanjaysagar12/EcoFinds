import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Logger,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  BadRequestException 
} from '@nestjs/common';
import { OrderService, OrderFilters, PaginationOptions } from './order.service';
import { CreateOrderDto } from './dto';
import { JwtGuard } from 'src/application/common/guards/jwt.guard';
import { RolesGuard } from 'src/application/common/guards/roles.guard';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';

@Controller('api/orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      return new BadRequestException(`Validation failed: ${messages}`);
    }
  }))
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('sub') userId: string,
  ) {
    this.logger.log(`User ${userId} creating a new order with ${createOrderDto.items.length} items`);
    
    try {
      const order = await this.orderService.createOrder(userId, createOrderDto);
      
      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Order created successfully',
        data: order,
      };
    } catch (error) {
      this.logger.error('Order creation failed:', error.message);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async getUserOrders(
    @GetUser('sub') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log(`User ${userId} fetching their orders`);
    
    const filters: OrderFilters = {
      status,
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    const result = await this.orderService.getUserOrders(userId, filters, pagination);
    
    return {
      status: 'success',
      statusCode: HttpStatus.OK,
      message: 'Orders retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async getOrderById(
    @Param('id') orderId: string,
    @GetUser('sub') userId: string,
  ) {
    this.logger.log(`User ${userId} fetching order ${orderId}`);
    
    try {
      const order = await this.orderService.getOrderById(orderId, userId);
      
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Order retrieved successfully',
        data: order,
      };
    } catch (error) {
      this.logger.error('Order retrieval failed:', error.message);
      throw error;
    }
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
    @GetUser('sub') userId: string,
  ) {
    this.logger.log(`User ${userId} updating order ${orderId} status to ${status}`);
    
    try {
      const order = await this.orderService.updateOrderStatus(orderId, status, userId);
      
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Order status updated successfully',
        data: order,
      };
    } catch (error) {
      this.logger.error('Order status update failed:', error.message);
      throw error;
    }
  }
}
