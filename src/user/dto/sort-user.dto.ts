import { User } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SortDto } from '../../dto/sort.dto';

import { UserDtoErrorMessages as UserDtoErrMsg } from '../constants/user-dto-error-messages.enum';

export class SortUserDto extends SortDto {
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
