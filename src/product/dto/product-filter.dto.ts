import {
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';
import { ToNumber, Trim } from '../../decorators';

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(1)
  @MaxLength(100)
  readonly title?: string;

  @IsOptional()
  @IsNumber({}, { message: 'minPrice must be a valid number' })
  @ToNumber()
  @Min(0)
  readonly minPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'maxPrice must be a valid number' })
  @ToNumber()
  @Min(0)
  readonly maxPrice?: number;
}
