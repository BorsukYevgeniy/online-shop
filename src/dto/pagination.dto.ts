import { IsOptional, IsInt, Min } from 'class-validator';
import { ToNumber } from '../decorators';

export class PaginationDto {
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be positive' })
  page?: number = 1;

  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'PageSize must be an integer' })
  @Min(1, { message: 'PageSize must be positive' })
  pageSize?: number = 10;
}
