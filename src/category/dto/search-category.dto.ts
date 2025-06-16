import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CategoryDtoErrorMessages as CategoryDtoErrMsg } from '../enum/category-dto-error-messages.enum';

export class SearchCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: CategoryDtoErrMsg.InvalidName })
  @MaxLength(50, { message: CategoryDtoErrMsg.InvalidName })
  name?: string;
}
