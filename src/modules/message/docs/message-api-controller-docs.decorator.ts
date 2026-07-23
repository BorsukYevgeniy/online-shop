import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiVerifiedAuthDocs } from '../../../common/decorators/docs/auth';

export function MessageApiControllerDocs() {
  return applyDecorators(
    ApiTags('API Messages'),
    ApiVerifiedAuthDocs(),
    ApiNotFoundResponse({ description: 'Message not found' }),
    ApiParam({ name: 'messageId', type: Number }),
  );
}
