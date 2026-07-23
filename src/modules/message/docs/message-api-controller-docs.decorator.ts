import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiUnauthorizedResponseDocs,
  ApiVerifiedForbiddenResponseDocs,
  AuthCookiesDocs,
} from '../../../common/decorators/docs/auth';

export function MessageApiControllerDocs() {
  return applyDecorators(
    ApiTags('API Messages'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponseDocs,
    ApiVerifiedForbiddenResponseDocs(),
    ApiNotFoundResponse({ description: 'Message not found' }),
    ApiParam({ name: 'messageId', type: Number }),
  );
}
