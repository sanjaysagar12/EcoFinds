import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Logger,
  HttpStatus 
} from '@nestjs/common';
import { JwtGuard } from '../application/common/guards/jwt.guard';
import { RolesGuard } from '../application/common/guards/roles.guard';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Controller('api/address')
@UseGuards(JwtGuard, RolesGuard)
export class AddressController {
  private readonly logger = new Logger(AddressController.name);

  constructor(private readonly addressService: AddressService) {}

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  async getUserAddresses(@GetUser('sub') userId: string) {
    this.logger.log(`Fetching addresses for user ${userId}`);
    const addresses = await this.addressService.getUserAddresses(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Addresses fetched successfully',
      data: addresses
    };
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  async getAddress(
    @Param('id') addressId: string,
    @GetUser('sub') userId: string
  ) {
    this.logger.log(`Fetching address ${addressId} for user ${userId}`);
    const address = await this.addressService.getAddress(addressId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Address fetched successfully',
      data: address
    };
  }

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @GetUser('sub') userId: string
  ) {
    this.logger.log(`Creating new address for user ${userId}`);
    const address = await this.addressService.createAddress(userId, createAddressDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Address created successfully',
      data: address
    };
  }

  @Put(':id')
  @Roles(Role.USER, Role.ADMIN)
  async updateAddress(
    @Param('id') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @GetUser('sub') userId: string
  ) {
    this.logger.log(`Updating address ${addressId} for user ${userId}`);
    const address = await this.addressService.updateAddress(addressId, userId, updateAddressDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Address updated successfully',
      data: address
    };
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  async deleteAddress(
    @Param('id') addressId: string,
    @GetUser('sub') userId: string
  ) {
    this.logger.log(`Deleting address ${addressId} for user ${userId}`);
    const result = await this.addressService.deleteAddress(addressId, userId);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }
}
