import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, IsArray, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  // Basic Details
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @IsString()
  @IsNotEmpty()
  condition: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  yearOfManufacture?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  // Physical Properties
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  dimensionLength?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  dimensionWidth?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  dimensionHeight?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  weight?: number;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  color?: string;

  // Additional Info
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  originalPackaging?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  manualIncluded?: boolean;

  @IsOptional()
  @IsString()
  workingConditionDesc?: string;

  // Images
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // System fields
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}