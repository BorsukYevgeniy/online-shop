import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { ToNumber, Trim, ToNumberArray } from '../../decorators';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3)
  @MaxLength(100)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(10)
  @MaxLength(500)
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ToNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsArray()
  @ToNumberArray()
  readonly categoryIds: number[];
}
