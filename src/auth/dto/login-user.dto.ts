import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../decorators/';

export class LoginUserDto {
  @IsNotEmpty()
  @Trim()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
