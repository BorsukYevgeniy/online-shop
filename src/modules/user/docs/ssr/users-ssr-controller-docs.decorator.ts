import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthDocs } from '../../../../common/decorators/docs/auth';

export function UserSsrControllerDocs() {
  return applyDecorators(ApiTags('SSR Users'), ApiAuthDocs());
}
