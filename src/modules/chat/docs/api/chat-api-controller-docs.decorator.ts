import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiVerifiedAuthDocs } from '../../../../common/decorators/docs/auth';

export function ChatApiControllerDocs() {
  return applyDecorators(ApiTags('API Chats'), ApiVerifiedAuthDocs());
}
