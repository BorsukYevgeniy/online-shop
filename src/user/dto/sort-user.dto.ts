import { User } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SortDto } from '../../common/dto/sort.dto';

import { UserDtoErrorMessages as UserDtoErrMsg } from '../constants/user-dto-error-messages.enum';

import { ApiProperty } from '@nestjs/swagger';

export class SortUserDto extends SortDto {
  @ApiProperty({
    type: String,
    enum: ['id', 'role', 'nickname', 'createdAt', 'isVerified', 'verifiedAt'],
    enumName: 'SortUserFields',
    required: false,
    example: 'role',
    default: 'id',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['id', 'role', 'nickname', 'createdAt', 'isVerified', 'verifiedAt'], {
    message: UserDtoErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Omit<
    User,
    'password' | 'verificationLink' | 'email'
  > = 'id';
}
