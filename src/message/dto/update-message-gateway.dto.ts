import { UpdateMessageDto } from './update-message.dto';

import { IsNumber } from 'class-validator';

export class UpdateMessageGatewayDto extends UpdateMessageDto {
  @IsNumber()
  messageId: number;

  @IsNumber()
  chatId: number;
}
