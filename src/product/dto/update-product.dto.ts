import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  MinLength,
} from 'class-validator';
import { ToNumber, Trim, ToNumberArray } from '../../decorators';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value))
  @Trim()
  @MinLength(3)
  @MaxLength(100)
  readonly title?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(10)
  @MaxLength(500)
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value))
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @Min(0)
  readonly price?: number;

  @IsOptional()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds?: number[];
}
