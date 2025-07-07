import { IsString, MinLength, MaxLength } from 'class-validator';

import { MessageDtoErroMessages as MessageDtoErrMsg } from '../enum/message-dto-error-messages.enum';
import { Trim } from '../../decorators';

export class CreateMessageDto {
  @IsString({ message: MessageDtoErrMsg.InvalidText })
  @MinLength(3, { message: MessageDtoErrMsg.InvalidText })
  @MaxLength(400, { message: MessageDtoErrMsg.InvalidText })
  @Trim()
  text: string;
}
