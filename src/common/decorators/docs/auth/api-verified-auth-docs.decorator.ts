import { applyDecorators } from '@nestjs/common';
import { ApiAuthDocs } from './api-auth-docs.decorator';
import { ApiVerifiedForbiddenResponseDocs } from './api-verified-forbidden-response-docs.decorator';

export function ApiVerifiedAuthDocs() {
  return applyDecorators(ApiAuthDocs(), ApiVerifiedForbiddenResponseDocs());
}
