import { Chat } from '@prisma/client';
import { MessageNickname } from '../../message/types/message.type';

/**
 * Represents a chat entry for the current user.
 *
 * @property id - The unique identifier of the chat.
 * @property withWhom - The nickname of the other participant in the chat (excluding the current user).
 */
export type UserChat = { id: number; withWhom: string };

/**
 * Represents a chat with messages
 *
 * @property messages - The messages in this chat
 */
export type ChatMessages = Chat & { messages: Omit<MessageNickname, 'text'>[] };
