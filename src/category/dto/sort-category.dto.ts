import { Category } from '@prisma/client';
import { SortDto } from '../../dto/sort.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryDtoErrorMessages as CategoryDtoErrMsg } from '../enum/category-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SortCategoryDto extends SortDto {
  @ApiProperty({
    type: String,
    enum: ['name', 'id', 'description'],
    enumName: 'SortCategoryFields',
    description: 'The field by which sorting will take place',
    default: 'id',
    example: 'name'
  })
  @IsOptional()
  @IsString()
  @IsEnum(['name', 'id', 'description'], {
    message: CategoryDtoErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Category = 'id';
}
