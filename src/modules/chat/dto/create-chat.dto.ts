import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { ChatDtoErrorMessages as ChatDtoErrMsg } from '../enum/chat-dto-error-messages.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    type: Number,
    description: 'Id of seller',
    required: true,
    minimum: 1,
    example: 123,
  })
  @IsInt()
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  @Type(() => Number)
  sellerId: number;

  @ApiProperty({
    type: Number,
    description: 'Id of buyer',
    required: true,
    minimum: 1,
    example: 123,
  })
  @IsInt()
  @IsPositive({ message: ChatDtoErrMsg.InvalidId })
  @Type(() => Number)
  buyerId: number;
}
