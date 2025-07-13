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
import { ApiProperty } from '@nestjs/swagger';

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
  @IsNumber({}, { message: ProductDtoErrMsg.InvalidPrice })
  @ToNumber()
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
  @IsNumber({}, { message: ProductDtoErrMsg.InvalidPrice })
  @ToNumber()
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
  @ToNumberArray()
  readonly categoryIds?: number[];
}
