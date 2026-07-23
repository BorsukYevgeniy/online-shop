import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import {
  ApiVerifiedForbiddenResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';

export function ChatApiControllerDocs() {
  return applyDecorators(
    ApiTags('API Chats'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponse(),
    ApiVerifiedForbiddenResponseDocs(),
  );
}
