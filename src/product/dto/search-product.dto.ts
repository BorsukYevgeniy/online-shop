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
import { ProductErrorMessages as ProductErrMsg } from '../enum/product-error-messages.enum';

export class SearchProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductErrMsg.InvalidTitle })
  @MaxLength(100)
  readonly title?: string;

  @IsOptional()
  @IsNumber({}, { message: 'minPrice must be a valid number' })
  @ToNumber()
  @Min(0, { message: ProductErrMsg.InvalidPrice })
  readonly minPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'maxPrice must be a valid number' })
  @ToNumber()
  @Min(0, { message: ProductErrMsg.InvalidPrice })
  readonly maxPrice?: number;

  @IsOptional()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds?: number[];
}
