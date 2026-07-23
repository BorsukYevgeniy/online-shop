import { ApiParam } from '@nestjs/swagger';

export function ApiChatIdParamDocs() {
  return ApiParam({
    name: 'chatId',
    type: Number,
    description: 'Id of the chat',
    required: true,
  });
}
