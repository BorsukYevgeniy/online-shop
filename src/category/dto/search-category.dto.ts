import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CategoryDtoErrorMessages as CategoryDtoErrMsg } from '../enum/category-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SearchCategoryDto {
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
  @MinLength(3, { message: CategoryDtoErrMsg.InvalidName })
  @MaxLength(50, { message: CategoryDtoErrMsg.InvalidName })
  name?: string;
}
