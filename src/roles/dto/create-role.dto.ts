import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../decorators';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(10)
  @MinLength(3)
  readonly value: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(50)
  @MinLength(15)
  readonly description: string;
}
