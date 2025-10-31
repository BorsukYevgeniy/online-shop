import { IsArray, IsNumber, IsOptional, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class SearchProductDto extends PartialType(
  OmitType(CreateProductDto, ['price', 'description']),
) {
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
