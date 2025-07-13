import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { CategoryDtoErrorMessages as CategoryDtoErrMsg } from '../enum/category-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
    description: 'Name of category',
    example: 'Electronics',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: CategoryDtoErrMsg.InvalidName })
  @MaxLength(50, { message: CategoryDtoErrMsg.InvalidName })
  name: string;

  @ApiProperty({
    type: String,
    required: true,
    minLength: 10,
    maxLength: 150,
    description: 'Description of category',
    example: 'Category for electronics',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: CategoryDtoErrMsg.InvalidDescription })
  @MaxLength(150, { message: CategoryDtoErrMsg.InvalidDescription })
  description: string;
}
