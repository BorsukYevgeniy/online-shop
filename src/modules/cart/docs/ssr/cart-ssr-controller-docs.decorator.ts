import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthDocs } from '../../../../common/decorators/docs/auth';

export function CartSsrControllerDocs() {
  return applyDecorators(ApiTags('SSR Carts'), ApiAuthDocs());
}
