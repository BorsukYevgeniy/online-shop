import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../../common/decorators/validation'

import { AuthDtoErrorMessages as AuthDtoErrMsg } from 'src/modules/auth/enum/auth-dto-error-messages.enum';
import { UserDtoErrorMessages as UserDtoErrMsg } from '../constants/user-dto-error-messages.enum';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    example: 'example@gmail.com',
    description: 'Email of user',
    required: true,
  })
  @IsNotEmpty()
  @Trim()
  @IsEmail({}, { message: AuthDtoErrMsg.InvalidEmail })
  readonly email: string;

  @ApiProperty({
    type: String,
    example: 'nickname',
    description: 'Nickname of user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3, { message: UserDtoErrMsg.InvalidNickname })
  @MaxLength(15, { message: UserDtoErrMsg.InvalidNickname })
  readonly nickname: string;

  @ApiProperty({
    type: String,
    example: 'iopJKL09876',
    description: 'Password of user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6, { message: AuthDtoErrMsg.InvalidPassword })
  @MaxLength(20, { message: AuthDtoErrMsg.InvalidPassword })
  readonly password: string;
}
