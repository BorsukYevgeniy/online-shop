import { Message } from '@prisma/client';
import { Paginated } from '../../types/pagination.type';

/**
 * Represents message type with nickname fields
 */

export type MessageNickname = Message & { user: { nickname: string } };



export type PaginatedMessages = Paginated<MessageNickname[],'messages'>;