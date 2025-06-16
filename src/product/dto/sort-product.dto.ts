import { Product } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { ProductDtoErrorMessages as ProductDtoErrMsg } from '../enum/product-dto-error-messages.enum';

export class SortProductDto extends SortDto {
  @IsOptional()
  @IsString()
  @IsEnum(['title', 'id', 'price'], {
    message: ProductDtoErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Omit<Product, 'images' | 'userId' | 'description'> =
    'id';
}
