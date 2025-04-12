import { Product } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';

export class SortProductDto extends SortDto {
  readonly sortBy?: keyof Omit<Product, 'images'> = 'id';
}
