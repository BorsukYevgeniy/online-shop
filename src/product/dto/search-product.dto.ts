import {
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Trim } from '../../common/decorators/validation'

import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchProductDto {
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
  @MaxLength(100)
  readonly title?: string;

  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
    example: 1000,
    description: 'Minimal price for searching',
  })
  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: ProductDtoErrMsg.InvalidPrice },
  )
  @Type(() => Number)
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  readonly minPrice?: number;

  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
    example: 1000,
    description: 'Maximal price for searching',
  })
  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: ProductDtoErrMsg.InvalidPrice },
  )
  @Type(() => Number)
  @Min(0, { message: ProductDtoErrMsg.InvalidPrice })
  readonly maxPrice?: number;

  @ApiProperty({
    type: [Number],
    required: false,
    example: [1, 2],
    description: 'Id of categories to which the product belongs',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  readonly categoryIds?: number[];
}
