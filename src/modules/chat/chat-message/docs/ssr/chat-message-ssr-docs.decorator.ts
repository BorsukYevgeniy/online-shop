import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiAdminForbiddenResponseDocs,
  ApiUnauthorizedResponseDocs,
} from '../../../../../common/decorators/docs/auth';
import {
  ApiChatIdParamDocs,
  ApiChatNotFoundResponseDocs,
} from '../../../docs/shared';

export function ChatMessageSsrControllerDocs() {
  return applyDecorators(
    ApiTags('SSR ChatMessages'),
    ApiCookieAuth('accessToken'),
    ApiUnauthorizedResponseDocs(),
    ApiAdminForbiddenResponseDocs(),
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
