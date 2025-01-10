import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDate,
} from 'class-validator';
import { ToDate, Trim } from '../../decorators';

export class UserFilterDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3)
  @MaxLength(15)
  readonly nickname?: string;

  @IsOptional()
  @IsDate({ message: 'Date should be in YYYY-MM-DD format' })
  @ToDate()
  readonly minDate?: Date;

  @IsOptional()
  @IsDate({ message: 'Date should be in YYYY-MM-DD format1' })
  @ToDate()
  readonly maxDate?: Date;
}
