import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async getUserAddresses(userId: string) {
    try {
      return await this.prisma.address.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' }, // Default address first
          { createdAt: 'desc' }   // Then by creation date
        ]
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch addresses');
    }
  }

  async getAddress(addressId: string, userId: string) {
    try {
      const address = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId
        }
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      return address;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch address');
    }
  }

  async createAddress(userId: string, createAddressDto: CreateAddressDto) {
    try {
      // If this is set as default, unset other default addresses
      if (createAddressDto.isDefault) {
        await this.prisma.address.updateMany({
          where: { 
            userId,
            isDefault: true 
          },
          data: { isDefault: false }
        });
      }

      return await this.prisma.address.create({
        data: {
          ...createAddressDto,
          userId
        }
      });
    } catch (error) {
      throw new BadRequestException('Failed to create address');
    }
  }

  async updateAddress(addressId: string, userId: string, updateAddressDto: UpdateAddressDto) {
    try {
      // Check if address exists and belongs to user
      const existingAddress = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId
        }
      });

      if (!existingAddress) {
        throw new NotFoundException('Address not found');
      }

      // If setting as default, unset other default addresses
      if (updateAddressDto.isDefault) {
        await this.prisma.address.updateMany({
          where: { 
            userId,
            isDefault: true,
            id: { not: addressId }
          },
          data: { isDefault: false }
        });
      }

      return await this.prisma.address.update({
        where: { id: addressId },
        data: updateAddressDto
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update address');
    }
  }

  async deleteAddress(addressId: string, userId: string) {
    try {
      const address = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId
        }
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      await this.prisma.address.delete({
        where: { id: addressId }
      });

      return { message: 'Address deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete address');
    }
  }
}
