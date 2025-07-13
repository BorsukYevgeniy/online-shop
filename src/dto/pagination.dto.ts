import { IsOptional, IsInt, Min } from 'class-validator';
import { ToNumber } from '../decorators';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    type: Number,
    description: 'The number of page for pagination',
    required: false,
    minimum: 1,
    default: 1,
    example: 2,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be positive' })
  page?: number = 1;

  @ApiProperty({
    type: Number,
    description: 'The size of page for pagination',
    required: false,
    minimum: 1,
    default: 10,
    example: 15,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'PageSize must be an integer' })
  @Min(1, { message: 'PageSize must be positive' })
  pageSize?: number = 10;
}
