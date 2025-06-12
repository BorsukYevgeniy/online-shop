import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDate,
} from 'class-validator';
import { ToDate, Trim } from '../../decorators';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3)
  @MaxLength(15)
  readonly nickname?: string;

  @IsOptional()
  @IsDate()
  @ToDate()
  readonly minDate?: Date;

  @IsOptional()
  @IsDate()
  @ToDate()
  readonly maxDate?: Date;
}
