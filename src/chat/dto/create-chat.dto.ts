import { IsNumber, IsPositive } from 'class-validator';

import { ChatDtoErrorMessages as ChatDtoErrMsg } from '../enum/chat-dto-error-messages.enum';

export class CreateChatDto {
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ChatDtoErrMsg.InvalidId },
  )
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  sellerId: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ChatDtoErrMsg.InvalidId },
  )
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  buyerId: number;
}
