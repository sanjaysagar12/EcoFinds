import { Controller, Get, Put, Body, Logger, UseGuards, HttpStatus, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { JwtGuard } from '../application/common/guards/jwt.guard';
import { RolesGuard } from '../application/common/guards/roles.guard';
import { UserService } from './user.service';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';
import { UpdateUserProfileDto } from './dto';

@Controller("api/user")
@UseGuards(JwtGuard, RolesGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);
    
    constructor(private readonly userService: UserService) {}

    @Get('me')
    @Roles(Role.USER, Role.ADMIN)
    async getUserMe(@GetUser('sub') userId: string) {
        this.logger.log(`User ${userId} requested profile information`);
        const data = await this.userService.getUserMe(userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Profile fetched successfully',
            data: data,
        };
    }

    @Put('profile')
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
    async updateProfile(
        @Body() updateUserProfileDto: UpdateUserProfileDto,
        @GetUser('sub') userId: string
    ) {
        this.logger.log(`User ${userId} updating profile`);
        const updatedUser = await this.userService.updateUserProfile(userId, updateUserProfileDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Profile updated successfully',
            data: updatedUser
        };
    }
}
