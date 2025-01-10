import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ToNumber, Trim } from '../../decorators';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(100)
  title!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(500)
  description!: string;

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @Min(0)
  price!: number;
}
