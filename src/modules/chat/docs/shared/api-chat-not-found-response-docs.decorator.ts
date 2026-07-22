import { ApiNotFoundResponse } from '@nestjs/swagger';

export function ApiChatNotFoundResponseDocs() {
  return ApiNotFoundResponse({ description: 'Chat not found' });
}
