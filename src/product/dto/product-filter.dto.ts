import {
  IsOptional,
  IsString,
  IsNumberString,
  MaxLength,
  Min,
  IsNotEmpty
} from 'class-validator';

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsNumberString()
  @Min(0)
  @IsNotEmpty()
  minPrice?: number;

  @IsOptional()
  @IsNumberString()
  @Min(0)
  @IsNotEmpty()
  maxPrice?: number;
}
