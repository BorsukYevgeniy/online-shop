import { ApiProperty } from '@nestjs/swagger';
import { UpdateMessageDto } from './update-message.dto';

import { IsNumber } from 'class-validator';

export class UpdateMessageGatewayDto extends UpdateMessageDto {
  @ApiProperty({
    type: Number,
    description: 'Id of message which will be updated',
    required: true,
    example: 1,
  })
  @IsNumber()
  messageId: number;

  @ApiProperty({
    type: Number,
    description: 'Id of chat in which the message will be sent',
    required: true,
    example: 1,
  })
  @IsNumber()
  chatId: number;
}
