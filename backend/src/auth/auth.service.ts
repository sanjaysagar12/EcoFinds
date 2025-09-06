import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;

        try {
            // Additional manual validation
            if (!email || !email.includes('@')) {
                throw new BadRequestException('Please provide a valid email address');
            }
            
            if (!password || password.length < 8) {
                throw new BadRequestException('Password must be at least 8 characters long');
            }
            
            if (!username || username.length < 3) {
                throw new BadRequestException('Username must be at least 3 characters long');
            }

            // Check if user already exists with this email
            const existingUserByEmail = await this.prisma.user.findUnique({
                where: { email }
            });

            if (existingUserByEmail) {
                throw new ConflictException('User with this email already exists');
            }

            // Check if username is already taken (assuming we add username to schema)
            const existingUserByName = await this.prisma.user.findFirst({
                where: { name: username }
            });

            if (existingUserByName) {
                throw new ConflictException('Username is already taken');
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const user = await this.prisma.user.create({
                data: {
                    name: username,
                    email,
                    password: hashedPassword,
                    role: 'USER'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            // Generate JWT token
            const payload = { sub: user.id, role: user.role };
            const access_token = await this.jwtService.signAsync(payload);

            return {
                message: 'User registered successfully',
                user,
                access_token
            };

        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to register user. Please try again.');
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        try {
            // Additional manual validation
            if (!email || !email.includes('@')) {
                throw new BadRequestException('Please provide a valid email address');
            }
            
            if (!password || password.length < 1) {
                throw new BadRequestException('Password is required');
            }

            // Find user by email
            const user = await this.prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            // Check if user has a password (not OAuth-only user)
            if (!user.password) {
                throw new UnauthorizedException('Please sign in with Google or reset your password');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid email or password');
            }

            // Generate JWT token
            const payload = { sub: user.id, role: user.role };
            const access_token = await this.jwtService.signAsync(payload);

            return {
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                access_token
            };

        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Login failed. Please try again.');
        }
    }

    async googleSignin(id: string, role: string) {
        const payload = { sub: id, role: role };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };  
    }
}
