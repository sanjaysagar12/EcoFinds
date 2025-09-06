import { IsString, IsOptional, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^[+]?[1-9]\d{9,14}$/, { 
    message: 'Phone number must be a valid format (e.g., +1234567890 or 1234567890, 10-15 digits)' 
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatar?: string;
}