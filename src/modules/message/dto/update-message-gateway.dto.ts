import { ApiProperty } from '@nestjs/swagger';

import { IsInt } from 'class-validator';
import { SendMessageDto } from './send-message.dto';

export class UpdateMessageGatewayDto extends SendMessageDto {
  @ApiProperty({
    type: Number,
    description: 'Id of message which will be updated',
    required: true,
    example: 1,
  })
  @IsInt()
  messageId: number;
}
