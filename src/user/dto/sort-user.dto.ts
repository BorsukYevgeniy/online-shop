import { User } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SortDto } from '../../dto/sort.dto';
import { UserErrorMessages as UserErrMsg } from '../constants/user-error-messages.constants';

export class SortUserDto extends SortDto {
  @IsOptional()
  @IsString()
  @IsEnum(['id', 'role', 'nickname', 'createdAt', 'isVerified', 'verifiedAt'], {
    message: UserErrMsg.InvalidSortFields,
  })
  readonly sortBy?: keyof Omit<
    User,
    'password' | 'verificationLink' | 'email'
  > = 'id';
}
