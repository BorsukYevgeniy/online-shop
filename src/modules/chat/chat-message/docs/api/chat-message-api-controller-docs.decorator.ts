import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthCookiesDocs } from '../../../../../common/decorators/docs/auth';
import {
  ApiChatIdParamDocs,
  ApiChatNotFoundResponseDocs,
} from '../../../docs/shared';

export function ChatMessageApiControllerDocs() {
  return applyDecorators(
    ApiTags('API ChatMessages'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponse(),
    ApiChatNotFoundResponseDocs(),
    ApiChatIdParamDocs(),
  );
}
