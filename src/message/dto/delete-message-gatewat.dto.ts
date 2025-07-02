import { IsNumber } from 'class-validator';

export class DeleteMessageGatewayDto {
  @IsNumber()
  messageId: number;

  @IsNumber()
  chatId: number;
}
