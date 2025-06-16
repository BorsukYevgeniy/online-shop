import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDate,
} from 'class-validator';
import { ToDate, Trim } from '../../decorators';

import { UserDtoErrorMessages as UserDtoErrMsg } from '../constants/user-dto-error-messages.enum';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: UserDtoErrMsg.InvalidNickname })
  @MaxLength(15, { message: UserDtoErrMsg.InvalidNickname })
  readonly nickname?: string;

  @IsOptional()
  @IsDate({ message: UserDtoErrMsg.InvalidDate })
  @ToDate()
  readonly minDate?: Date;

  @IsOptional()
  @IsDate({ message: UserDtoErrMsg.InvalidDate })
  @ToDate()
  readonly maxDate?: Date;
}
