import {
  ArgumentMetadata,
  BadRequestException,
  Logger,
  PipeTransform,
} from '@nestjs/common';

import { CreateChatDto } from '../dto/create-chat.dto';

import { ChatErrorMessages as ChatErrMsg } from '../enum/chat-error-message.enum';

export class ValidateCreateChatDtoPipe
  implements PipeTransform<CreateChatDto, CreateChatDto>
{
  private readonly logger: Logger = new Logger(ValidateCreateChatDtoPipe.name);

  transform(value: CreateChatDto, metadata: ArgumentMetadata): CreateChatDto {
    const { buyerId, sellerId } = value;

    if (buyerId === sellerId) {
      this.logger.warn(
        `User with ID ${buyerId} cannot create a chat with themselves.`,
      );
      throw new BadRequestException(ChatErrMsg.CannotCreateChatWithSelf);
    }

    return value;
  }
}
