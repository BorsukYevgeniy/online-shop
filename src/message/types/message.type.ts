import { Message } from '@prisma/client';

/**
 * Represents message type with nickname fields
 */

export type MessageNickname = Message & { user: { nickname: string } };
