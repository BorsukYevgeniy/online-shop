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

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3)
  @MaxLength(100)
  readonly title?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(10)
  @MaxLength(500)
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
