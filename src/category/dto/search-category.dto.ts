import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SearchCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Min lenght of name is 3 symbols' })
  @MaxLength(50, { message: 'Max lenght of name is 50 symbols' })
  name?: string;
}
