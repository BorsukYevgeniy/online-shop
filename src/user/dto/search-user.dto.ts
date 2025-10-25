import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDate,
} from 'class-validator';
import { Trim } from '../../common/decorators/validation'
import { UserDtoErrorMessages as UserDtoErrMsg } from '../constants/user-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchUserDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Nickname of searched user',
    example: 'Nickname228',
  })
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: UserDtoErrMsg.InvalidNickname })
  @MaxLength(15, { message: UserDtoErrMsg.InvalidNickname })
  readonly nickname?: string;

  @ApiProperty({
    type: Date,
    required: false,
    description: 'Minimal date for searching. Should be in YYYY-MM-DD format',
    example: '2000-01-01',
  })
  @IsOptional()
  @IsDate({ message: UserDtoErrMsg.InvalidDate })
  @Type(() => Date)
  readonly minDate?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description: 'Maximal date for searching. Should be in YYYY-MM-DD format',
    example: '2005-01-01',
  })
  @IsOptional()
  @IsDate({ message: UserDtoErrMsg.InvalidDate })
  @Type(() => Date)
  readonly maxDate?: Date;
}
