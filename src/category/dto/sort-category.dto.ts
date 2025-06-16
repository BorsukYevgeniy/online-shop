import { Category } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryErrorMessages as CategoryErrMsg } from '../enum/category-error-messages.enum';

export class SortCategoryDto extends SortDto {
  @IsOptional()
  @IsString()
  @IsEnum(['name', 'id', 'description'], {
    message: CategoryErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Category = 'id';
}
