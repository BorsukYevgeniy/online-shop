import { Category } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryDtoErrorMessages as CategoryDtoErrMsg } from '../enum/category-dto-error-messages.enum';

export class SortCategoryDto extends SortDto {
  @IsOptional()
  @IsString()
  @IsEnum(['name', 'id', 'description'], {
    message: CategoryDtoErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Category = 'id';
}
