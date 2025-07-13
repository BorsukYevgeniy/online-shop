import { IsNumber, IsPositive } from 'class-validator';

import { ChatDtoErrorMessages as ChatDtoErrMsg } from '../enum/chat-dto-error-messages.enum';
import { ToNumber } from '../../decorators';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    type: Number,
    description: 'Id of seller',
    required: true,
    minimum: 1,
    example: 123,
  })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ChatDtoErrMsg.InvalidId },
  )
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  @ToNumber()
  sellerId: number;

  @ApiProperty({
    type: Number,
    description: 'Id of buyer',
    required: true,
    minimum: 1,
    example: 123,
  })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ChatDtoErrMsg.InvalidId },
  )
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  @ToNumber()
  buyerId: number;
}
