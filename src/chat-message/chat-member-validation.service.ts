import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ChatMemberValidationRepository } from './chat-member-validation.repository';

import { ChatErrorMessages as ChatErrMsg } from '../chat/enum/chat-error-message.enum';

@Injectable()
export class ChatMemberValidationService {
  private readonly logger: Logger = new Logger(
    ChatMemberValidationService.name,
  );

  constructor(private readonly repository: ChatMemberValidationRepository) {}

  async validateChatMembers(
    chatId: number,
    userId: number,
  ): Promise<void> {
    this.logger.log(`Validating participants for chat ID ${chatId}.`);

    const chat = await this.repository.getUsersInChat(chatId);
    if (!chat) {
      this.logger.warn(`Chat with ID ${chatId} not found.`);
      throw new NotFoundException(ChatErrMsg.ChatNotFound);
    }

    const isParticipant = chat.users.some((u) => u.id === userId);
    if (!isParticipant) {
      this.logger.warn(
        `User with ID ${userId} is not a participant in chat ID ${chatId}.`,
      );
      throw new ForbiddenException();
    }

    this.logger.log(
      `User with ID ${userId} is a participant in chat ID ${chatId}.`,
    );
  }
}
