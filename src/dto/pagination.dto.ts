import { IsOptional, IsNumberString, Min } from 'class-validator';

export class PaginationDto {
  
  @IsOptional()
  @IsNumberString()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumberString()
  @Min(1)
  pageSize?: number = 10;
}
