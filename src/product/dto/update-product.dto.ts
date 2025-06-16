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
import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductDtoErrMsg.InvalidTitle })
  @MaxLength(100, { message: ProductDtoErrMsg.InvalidTitle })
  readonly title?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(10, { message: ProductDtoErrMsg.InvalidDescription })
  @MaxLength(500, { message: ProductDtoErrMsg.InvalidDescription })
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  readonly price?: number;

  @IsOptional()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds?: number[];
}
