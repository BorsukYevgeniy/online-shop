import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../common/decorators/validation';

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
  @IsEmail({}, { message: UserDtoErrMsg.InvalidEmail })
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
  @Length(3, 15, { message: UserDtoErrMsg.InvalidNickname })
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
  @Length(6, 20, { message: UserDtoErrMsg.InvalidPassword })
  readonly password: string;
}
