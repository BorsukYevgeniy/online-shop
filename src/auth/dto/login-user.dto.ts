import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../decorators/';
import { AuthErrorMessages as AuthErrMsg } from '../enum/auth-error-messages.enum';

export class LoginUserDto {
  @IsNotEmpty()
  @Trim()
  @IsEmail({}, { message: AuthErrMsg.InvalidEmail })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6, { message: AuthErrMsg.InvalidPassword })
  @MaxLength(20, { message: AuthErrMsg.InvalidPassword })
  password: string;
}
