import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'Street is required' })
  street: string;

  @IsString({ message: 'City is required' })
  city: string;

  @IsString({ message: 'State is required' })
  state: string;

  @IsOptional()
  @IsString({ message: 'County must be a string' })
  county?: string;

  @IsString({ message: 'Pincode is required' })
  pincode: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @IsOptional()
  @IsBoolean({ message: 'isDefault must be a boolean' })
  isDefault?: boolean;
}
