import { IsString, IsInt, IsOptional, Min, IsNotEmpty, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @IsOptional()
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity?: number = 1;
}
