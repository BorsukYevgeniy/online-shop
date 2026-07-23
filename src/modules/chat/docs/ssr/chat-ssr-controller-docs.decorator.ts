import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import {
  ApiVerifiedForbiddenResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';

export function ChatSsrControllerDocs() {
  return applyDecorators(
    ApiTags('SSR Chats'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponse(),
    ApiVerifiedForbiddenResponseDocs(),
  );
}
