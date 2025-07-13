import { Product } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SortProductDto extends SortDto {
  @ApiProperty({
    type: String,
    enum: ['id', 'title', 'price'],
    enumName: 'SortProductFields',
    required: false,
    example: 'title',
    default: 'id',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['title', 'id', 'price'], {
    message: ProductDtoErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Omit<Product, 'images' | 'userId' | 'description'> =
    'id';
}
