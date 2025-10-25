import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  IsArray,
  IsInt,
} from 'class-validator';
import { Trim, ToNumberArray } from '../../common/decorators/validation';
import { Type } from 'class-transformer';

import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
    example: 'Smartphone',
    description: 'Name of product',
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3, { message: ProductDtoErrMsg.InvalidTitle })
  @MaxLength(100, { message: ProductDtoErrMsg.InvalidTitle })
  readonly title: string;

  @ApiProperty({
    type: String,
    required: true,
    minLength: 10,
    maxLength: 500,
    example: 'Characteristics of product',
    description: 'Description of product',
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(10, { message: ProductDtoErrMsg.InvalidDescription })
  @MaxLength(500, { message: ProductDtoErrMsg.InvalidDescription })
  readonly description: string;

  @ApiProperty({
    type: Number,
    required: true,
    minimum: 0,
    example: 10_000,
    description: 'Price of product',
  })
  @IsNotEmpty()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: ProductDtoErrMsg.InvalidPrice },
  )
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  @Type(() => Number)
  readonly price: number;

  @ApiProperty({
    type: [Number],
    required: true,
    example: [1, 2],
    description: 'Id of categories to which the product belongs',
  })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @ToNumberArray()
  categoryIds: number[];
}
