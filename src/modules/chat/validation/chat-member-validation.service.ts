import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ChatErrorMessages as ChatErrMsg } from '../enum/chat-error-message.enum';
import { ChatRepository } from '../repository/chat.repository';

@Injectable()
export class ChatMemberValidationService {
  private readonly logger: Logger = new Logger(
    ChatMemberValidationService.name,
  );

  constructor(private readonly chatRepo: ChatRepository) {}

  async validateChatMembers(chatId: number, userId: number): Promise<void> {
    this.logger.log(`Validating participants for chat ID ${chatId}.`);

    const chat = await this.chatRepo.getUsersInChat(chatId);
    if (!chat) {
      this.logger.warn(`Chat with ID ${chatId} not found.`);
      throw new NotFoundException(ChatErrMsg.ChatNotFound);
    }

    const isParticipant = chat.users.some((u) => u.id === userId);
    if (!isParticipant) {
      this.logger.warn(
        `User with ID ${userId} is not a participant in chat ID ${chatId}.`,
      );
      throw new ForbiddenException('You must be a participant of the chat');
    }

    this.logger.log(
      `User with ID ${userId} is a participant in chat ID ${chatId}.`,
    );
  }
}
