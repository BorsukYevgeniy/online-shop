import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  MinLength,
} from 'class-validator';
import { Trim, ToNumberArray } from '../../common/decorators/validation';
import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({
    type: String,
    required: false,
    minLength: 3,
    maxLength: 100,
    example: 'Smartphone',
    description: 'Name of product',
  })
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductDtoErrMsg.InvalidTitle })
  @MaxLength(100, { message: ProductDtoErrMsg.InvalidTitle })
  readonly title?: string;

  @ApiProperty({
    type: String,
    required: false,
    minLength: 10,
    maxLength: 500,
    example: 'Characteristics of product',
    description: 'Description of product',
  })
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(10, { message: ProductDtoErrMsg.InvalidDescription })
  @MaxLength(500, { message: ProductDtoErrMsg.InvalidDescription })
  readonly description?: string;

  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
    example: 10_000,
    description: 'Price of product',
  })
  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: ProductDtoErrMsg.InvalidPrice },
  )
  @Type(() => Number)
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  readonly price?: number;

  @ApiProperty({
    type: [Number],
    required: false,
    example: [1, 2],
    description: 'Id of categories to which the product belongs',
  })
  @IsOptional()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds?: number[];
}
