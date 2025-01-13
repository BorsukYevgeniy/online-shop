import { IsNotEmpty, IsString } from 'class-validator';

export class SearchCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
