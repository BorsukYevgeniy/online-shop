import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../decorators/';

import { AuthDtoErrorMessages as AuthDtoErrMsg } from '../enum/auth-dto-error-messages.enum';

import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    type: String,
    description: 'Email of user',
    required: true,
    example: 'example@gmail.com',
  })
  @IsNotEmpty()
  @Trim()
  @IsEmail({}, { message: AuthDtoErrMsg.InvalidEmail })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Password of user account',
    required: true,
    minLength: 6,
    maxLength: 20,
    example: 'iopJKL09876',
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6, { message: AuthDtoErrMsg.InvalidPassword })
  @MaxLength(20, { message: AuthDtoErrMsg.InvalidPassword })
  password: string;
}
