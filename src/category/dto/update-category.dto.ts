import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CategoryErrorMessages as CategoryErrMsg } from '../enum/category-error-messages.enum';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: CategoryErrMsg.InvalidName })
  @MaxLength(50, { message: CategoryErrMsg.InvalidName })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: CategoryErrMsg.InvalidDescription })
  @MaxLength(150, { message: CategoryErrMsg.InvalidDescription })
  description?: string;
}
