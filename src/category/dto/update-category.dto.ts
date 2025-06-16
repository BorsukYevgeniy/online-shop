import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CategoryDtoErrorMessages as CategortDtoErrMsg } from '../enum/category-dto-error-messages.enum';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: CategortDtoErrMsg.InvalidName })
  @MaxLength(50, { message: CategortDtoErrMsg.InvalidName })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: CategortDtoErrMsg.InvalidDescription })
  @MaxLength(150, { message: CategortDtoErrMsg.InvalidDescription })
  description?: string;
}
