import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAdminAuthDocs } from '../../../../../common/decorators/docs/auth';
import {
  ApiChatIdParamDocs,
  ApiChatNotFoundResponseDocs,
} from '../../../docs/shared';

export function ChatMessageSsrControllerDocs() {
  return applyDecorators(
    ApiTags('SSR ChatMessages'),
    ApiAdminAuthDocs(),
    ApiChatNotFoundResponseDocs(),
    ApiChatIdParamDocs(),
  );
}

export function GetMessagesByChatIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get messages in chat' }),
    ApiOkResponse({ description: 'Messages fetched' }),
  );
}
