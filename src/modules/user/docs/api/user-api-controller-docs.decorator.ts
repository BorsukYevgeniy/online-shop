import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthDocs } from '../../../../common/decorators/docs/auth';

export function UserApiControllerDocs() {
  return applyDecorators(ApiTags('API Users'), ApiAuthDocs());
}
