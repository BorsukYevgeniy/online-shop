import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price?: number;
}