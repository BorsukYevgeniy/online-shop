import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(15)
  readonly nickname: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;
}
