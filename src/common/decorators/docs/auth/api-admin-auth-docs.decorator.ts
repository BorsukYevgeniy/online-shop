import { applyDecorators } from '@nestjs/common';
import { ApiAdminForbiddenResponseDocs } from './api-admin-forbidden-response-docs.decorator';
import { ApiAuthDocs } from './api-auth-docs.decorator';

export function ApiAdminAuthDocs() {
  return applyDecorators(ApiAuthDocs(), ApiAdminForbiddenResponseDocs());
}
