import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsString({ message: 'Product ID must be a string' })
  productId: string;

  @IsOptional()
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity?: number = 1;
}
