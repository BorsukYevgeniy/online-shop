import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  MinLength,
} from 'class-validator';
import { ToNumber, Trim, ToNumberArray } from '../../decorators';
import { ProductErrorMessages as ProductErrMsg } from '../enum/product-error-messages.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductErrMsg.InvalidTitle })
  @MaxLength(100, { message: ProductErrMsg.InvalidTitle })
  readonly title?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(10, { message: ProductErrMsg.InvalidDescription })
  @MaxLength(500, { message: ProductErrMsg.InvalidDescription })
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @Min(0, { message: ProductErrMsg.InvalidPrice })
  readonly price?: number;

  @IsOptional()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds?: number[];
}
