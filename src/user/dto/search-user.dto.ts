import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDate,
} from 'class-validator';
import { ToDate, Trim } from '../../decorators';

import { UserErrorMessages as UserErrMsg } from '../constants/user-error-messages.constants';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3, { message: UserErrMsg.InvalidNickname })
  @MaxLength(15, { message: UserErrMsg.InvalidNickname })
  readonly nickname?: string;

  @IsOptional()
  @IsDate({ message: UserErrMsg.InvalidDate })
  @ToDate()
  readonly minDate?: Date;

  @IsOptional()
  @IsDate({ message: UserErrMsg.InvalidDate })
  @ToDate()
  readonly maxDate?: Date;
}
