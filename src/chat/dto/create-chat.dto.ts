import { IsNumber, IsPositive } from 'class-validator';

import { ChatDtoErrorMessages as ChatDtoErrMsg } from '../enum/chat-dto-error-messages.enum';
import { ToNumber } from 'src/decorators';

export class CreateChatDto {
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ChatDtoErrMsg.InvalidId },
  )
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  @ToNumber()
  sellerId: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ChatDtoErrMsg.InvalidId },
  )
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  @ToNumber()
  buyerId: number;
}
