import {
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ToNumber, ToNumberArray, Trim } from '../../decorators';

export class SearchProductDto {
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

  @IsOptional()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds?: number[];
}
