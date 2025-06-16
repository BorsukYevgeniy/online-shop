import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../decorators';

import { AuthErrorMessages as AuthErrMsg } from '../../auth/enum/auth-error-messages.enum';
import { UserErrorMessages as UserErrMsg } from '../../user/constants/user-error-messages.constants';

export class CreateUserDto {
  @IsNotEmpty()
  @Trim()
  @IsEmail({}, { message: AuthErrMsg.InvalidEmail })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3, { message: UserErrMsg.InvalidNickname })
  @MaxLength(15, { message: UserErrMsg.InvalidNickname })
  readonly nickname: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6, { message: AuthErrMsg.InvalidPassword })
  @MaxLength(20, { message: AuthErrMsg.InvalidPassword })
  readonly password: string;
}
