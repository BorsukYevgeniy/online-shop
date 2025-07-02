import { IsNumber } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

export class SendMessageDto extends CreateMessageDto {
  @IsNumber()
  chatId: number;
}
