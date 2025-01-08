import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserFilterDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(15)
  readonly nickname?: string;

  @IsOptional()
  @IsDateString({strict: true})
  @IsNotEmpty()
  readonly minDate?: Date;

  @IsOptional()
  @IsDateString({strict: true})
  @IsNotEmpty()
  readonly maxDate?: Date;
}
