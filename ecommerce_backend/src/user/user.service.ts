import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserProfileDto } from './dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getUserMe(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    createdAt: true
                }
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch user profile');
        }
    }

    async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto) {
        try {
            // Check if user exists
            const existingUser = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            if (!existingUser) {
                throw new NotFoundException('User not found');
            }

            // If email is being updated, check if it's already taken by another user
            if (updateUserProfileDto.email && updateUserProfileDto.email !== existingUser.email) {
                const emailExists = await this.prisma.user.findFirst({
                    where: { 
                        email: updateUserProfileDto.email,
                        NOT: { id: userId } // Exclude current user
                    }
                });

                if (emailExists) {
                    throw new ConflictException('Email is already taken by another user');
                }
            }

            // Update user profile
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: updateUserProfileDto,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    createdAt: true
                }
            });

            return updatedUser;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to update user profile');
        }
    }
}
