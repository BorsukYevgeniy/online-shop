import { Category } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';

export class SortCategoryDto extends SortDto {
  readonly sortBy?: keyof Category = 'id';
}
