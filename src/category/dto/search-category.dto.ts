import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CategoryErrorMessages as CategoryErrMsg } from '../enum/category-error-messages.enum';

export class SearchCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: CategoryErrMsg.InvalidName })
  @MaxLength(50, { message: CategoryErrMsg.InvalidName })
  name?: string;
}
