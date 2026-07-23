import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ChatSsrControllerDocs() {
  return applyDecorators(ApiTags('SSR Chats'));
}
