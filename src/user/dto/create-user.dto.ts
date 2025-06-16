import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../decorators';

import { AuthDtoErrorMessages as AuthDtoErrMsg } from 'src/auth/enum/auth-dto-error-messages.enum';
import { UserDtoErrorMessages as UserDtoErrMsg } from '../../user/constants/user-dto-error-messages.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @Trim()
  @IsEmail({}, { message: AuthDtoErrMsg.InvalidEmail })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3, { message: UserDtoErrMsg.InvalidNickname })
  @MaxLength(15, { message: UserDtoErrMsg.InvalidNickname })
  readonly nickname: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6, { message: AuthDtoErrMsg.InvalidPassword })
  @MaxLength(20, { message: AuthDtoErrMsg.InvalidPassword })
  readonly password: string;
}
