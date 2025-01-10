import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../decorators';

export class CreateUserDto {
  @IsNotEmpty()
  @Trim()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3)
  @MaxLength(15)
  readonly nickname: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;
}
