import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ToNumber, Trim, ToNumberArray } from '../../decorators';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(100)
  readonly title?: string;

  @IsOptional()
  @IsString()
  @Trim()
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
  readonly categoryIds?: number[]

}
