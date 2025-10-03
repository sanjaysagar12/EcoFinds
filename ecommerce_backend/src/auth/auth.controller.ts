import { Controller, Get, Post, Body, Logger, Req, Res, UseGuards, HttpStatus, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { GoogleAuthGuard } from 'src/application/common/guards/google-auth-guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller("api/auth")
export class AuthController {

    private readonly logger = new Logger(AuthController.name);
    constructor(private authService: AuthService) { }

    @Post('register')
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
    async register(@Body() registerDto: RegisterDto) {
        try {
            // Manual validation checks
            if (!registerDto.email) {
                throw new BadRequestException('Email is required');
            }
            if (!registerDto.password) {
                throw new BadRequestException('Password is required');
            }
            if (!registerDto.name) {
                throw new BadRequestException('Name is required');
            }

            const result = await this.authService.register(registerDto);
            return {
                statusCode: HttpStatus.CREATED,
                ...result
            };
        } catch (error) {
            this.logger.error('Registration failed:', error.message);
            throw error;
        }
    }

    @Post('login')
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
    async login(@Body() loginDto: LoginDto) {
        try {
            // Manual validation checks
            if (!loginDto.email) {
                throw new BadRequestException('Email is required');
            }
            if (!loginDto.password) {
                throw new BadRequestException('Password is required');
            }

            const result = await this.authService.login(loginDto);
            return {
                statusCode: HttpStatus.OK,
                ...result
            };
        } catch (error) {
            this.logger.error('Login failed:', error.message);
            throw error;
        }
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google/signin')
    async googleSignIn() {
        // This route initiates Google OAuth flow
        // The guard redirects to Google - we don't need to return anything
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async callback(@Req() req, @Res() res) {
        this.logger.log('Google authentication callback received');
        // After successful Google authentication, generate JWT
        const token = await this.authService.googleSignin(req.user.id, req.user.role);
        // console.log('Generated JWT:', token);
        // res.cookie('auth_token', token, {
        //     httpOnly: true,
        //     secure: false, // since you're on HTTP localhost
        //     sameSite: 'lax',
        //     maxAge: 1000 * 60 * 60 * 24,
        // });

        // Redirect to frontend or send success response
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token.access_token}`); // or wherever you want to redirect
    }
}
