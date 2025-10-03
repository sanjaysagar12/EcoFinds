import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString({ message: 'Street must be a string' })
  street?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'County must be a string' })
  county?: string;

  @IsOptional()
  @IsString({ message: 'Pincode must be a string' })
  pincode?: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @IsOptional()
  @IsBoolean({ message: 'isDefault must be a boolean' })
  isDefault?: boolean;
}
