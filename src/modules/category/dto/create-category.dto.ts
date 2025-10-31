import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { CategoryDtoErrorMessages as CategoryDtoErrMsg } from '../enum/category-dto-error-messages.enum';

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
  @Length(3, 50, { message: CategoryDtoErrMsg.InvalidName })
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
  @Length(10, 150, { message: CategoryDtoErrMsg.InvalidDescription })
  description: string;
}
