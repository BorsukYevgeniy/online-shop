import { IsString, MinLength, MaxLength } from 'class-validator';

import { MessageDtoErroMessages as MessageDtoErrMsg } from '../enum/message-dto-error-messages.enum';

export class UpdateMessageDto {
  @IsString({ message: MessageDtoErrMsg.InvalidText })
  @MinLength(3, { message: MessageDtoErrMsg.InvalidText })
  @MaxLength(400, { message: MessageDtoErrMsg.InvalidText })
  text: string;
}
