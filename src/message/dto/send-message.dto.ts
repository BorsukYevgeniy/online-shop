import { IsNumber } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto extends CreateMessageDto {
  @ApiProperty({
    type: Number,
    description: 'Id of chat in which the message will be sent',
    required: true,
    example: 1,
  })
  @IsNumber()
  chatId: number;
}
