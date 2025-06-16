import { Product } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ProductErrorMessages as ProductErrMsg } from '../enum/product-error-messages.enum';

export class SortProductDto extends SortDto {
  @IsOptional()
  @IsString()
  @IsEnum(['title', 'id', 'price'], {
    message: ProductErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Omit<Product, 'images' | 'userId' | 'description'> =
    'id';
}
