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

import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';

export class SearchProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductDtoErrMsg.InvalidTitle })
  @MaxLength(100)
  readonly title?: string;

  @IsOptional()
  @IsNumber({}, { message: 'minPrice must be a valid number' })
  @ToNumber()
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  readonly minPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'maxPrice must be a valid number' })
  @ToNumber()
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  readonly maxPrice?: number;

  @IsOptional()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds?: number[];
}
