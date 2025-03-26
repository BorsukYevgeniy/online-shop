import { User } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SortDto } from '../../dto/sort.dto';

export class SortUserDto extends SortDto {
  @IsOptional()
  @IsString()
  @IsEnum(['id', 'role', 'nickname', 'createdAt'])
  readonly sortBy?: keyof Omit<User, 'password' | 'email'> = 'id';
}
