import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { ToNumber, Trim, ToNumberArray } from '../../decorators';
import { ProductErrorMessages as ProductErrMsg } from '../enum/product-error-messages.enum';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductErrMsg.InvalidTitle })
  @MaxLength(100, { message: ProductErrMsg.InvalidTitle })
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(10, { message: ProductErrMsg.InvalidDescription })
  @MaxLength(500, { message: ProductErrMsg.InvalidDescription })
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: ProductErrMsg.InvalidPrice })
  @ToNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds: number[];
}
