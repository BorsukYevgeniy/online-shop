import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiUnauthorizedResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';

export function UserApiControllerDocs() {
  return applyDecorators(
    ApiTags('API Users'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponseDocs(),
  );
}
