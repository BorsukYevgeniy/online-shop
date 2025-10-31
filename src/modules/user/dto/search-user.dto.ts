import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { UserDtoErrorMessages as UserDtoErrMsg } from '../constants/user-dto-error-messages.enum';
import { CreateUserDto } from './create-user.dto';

export class SearchUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password']),
) {
  @ApiProperty({
    type: Date,
    required: false,
    description: 'Minimal date for searching. Should be in YYYY-MM-DD format',
    example: '2000-01-01',
  })
  @IsOptional()
  @IsDate({ message: UserDtoErrMsg.InvalidDate })
  @Type(() => Date)
  readonly minDate?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description: 'Maximal date for searching. Should be in YYYY-MM-DD format',
    example: '2005-01-01',
  })
  @IsOptional()
  @IsDate({ message: UserDtoErrMsg.InvalidDate })
  @Type(() => Date)
  readonly maxDate?: Date;
}
