import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
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
  @Type(() => Number)
  @IsInt({ message: 'PageSize must be an integer' })
  @Min(1, { message: 'PageSize must be positive' })
  pageSize?: number = 10;
}
