import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiAdminForbiddenResponseDocs,
  ApiUnauthorizedResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';

export function CartSsrControllerDocs() {
  return applyDecorators(
    ApiTags('SSR Carts'),
    AuthCookiesDocs(),
    ApiUnauthorizedResponseDocs(),
    ApiAdminForbiddenResponseDocs(),
  );
}
