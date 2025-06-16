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
import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductDtoErrMsg.InvalidTitle })
  @MaxLength(100, { message: ProductDtoErrMsg.InvalidTitle })
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(10, { message: ProductDtoErrMsg.InvalidDescription })
  @MaxLength(500, { message: ProductDtoErrMsg.InvalidDescription })
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  @ToNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds: number[];
}
