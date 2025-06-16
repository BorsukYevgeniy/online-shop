import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../decorators/';

import { AuthDtoErrorMessages as AuthDtoErrMsg } from '../enum/auth-dto-error-messages.enum';

export class LoginUserDto {
  @IsNotEmpty()
  @Trim()
  @IsEmail({}, { message: AuthDtoErrMsg.InvalidEmail })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6, { message: AuthDtoErrMsg.InvalidPassword })
  @MaxLength(20, { message: AuthDtoErrMsg.InvalidPassword })
  password: string;
}
