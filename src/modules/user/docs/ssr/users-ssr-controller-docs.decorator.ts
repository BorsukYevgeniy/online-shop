import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiUnauthorizedResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';

export function UserSsrControllerDocs() {
  return applyDecorators(
    ApiTags('SSR Users'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponseDocs(),
  );
}
