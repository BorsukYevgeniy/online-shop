import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ToNumber, Trim } from '../../decorators';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @Min(0)
  price?: number;
}
