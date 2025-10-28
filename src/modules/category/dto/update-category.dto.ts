import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CategoryDtoErrorMessages as CategortDtoErrMsg } from '../enum/category-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    type: String,
    required: false,
    minLength: 3,
    maxLength: 50,
    description: 'Name of category',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: CategortDtoErrMsg.InvalidName })
  @MaxLength(50, { message: CategortDtoErrMsg.InvalidName })
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
    minLength: 10,
    maxLength: 150,
    description: 'Description of category',
    example: 'Category for electronics',
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: CategortDtoErrMsg.InvalidDescription })
  @MaxLength(150, { message: CategortDtoErrMsg.InvalidDescription })
  description?: string;
}
