import { IsString, MinLength, MaxLength } from 'class-validator';

import { MessageDtoErroMessages as MessageDtoErrMsg } from '../enum/message-dto-error-messages.enum';
import { Trim } from '../../decorators'

import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    type: String,
    description: 'Text of message',
    required: true,
    minLength: 1,
    maxLength: 400,
    example: 'Hello',
  })
  @IsString({ message: MessageDtoErrMsg.InvalidText })
  @MinLength(1, { message: MessageDtoErrMsg.InvalidText })
  @MaxLength(400, { message: MessageDtoErrMsg.InvalidText })
  @Trim()
  text: string;
}
