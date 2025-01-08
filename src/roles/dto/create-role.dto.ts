import { IsString, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  @MinLength(3)
  readonly value: string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(15)
  readonly description: string;
}
