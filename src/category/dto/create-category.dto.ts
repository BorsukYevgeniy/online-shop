import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { CategoryDtoErrorMessages as CategoryDtoErrMsg } from '../enum/category-dto-error-messages.enum';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: CategoryDtoErrMsg.InvalidName })
  @MaxLength(50, { message: CategoryDtoErrMsg.InvalidName })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: CategoryDtoErrMsg.InvalidDescription })
  @MaxLength(150, { message: CategoryDtoErrMsg.InvalidDescription })
  description: string;
}
