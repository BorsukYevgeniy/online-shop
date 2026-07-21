import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiUnauthorizedResponseDocs,
  ApiVerifiedForbiddenResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';

export function CartApiControllerDocs() {
  return applyDecorators(
    ApiTags('API Carts'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponseDocs(),
    ApiVerifiedForbiddenResponseDocs(),
  );
}
