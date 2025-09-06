import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCartDto {
  @IsOptional()
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity?: number;
}
