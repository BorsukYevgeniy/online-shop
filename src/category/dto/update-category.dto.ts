import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Min lenght of name is 3 symbols' })
  @MaxLength(50, { message: 'Max lenght of name is 50 symbols' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Min lenght of description is 10 symbols' })
  @MaxLength(150, { message: 'Max lenght of description is 150 symbols' })
  description?: string;
}
