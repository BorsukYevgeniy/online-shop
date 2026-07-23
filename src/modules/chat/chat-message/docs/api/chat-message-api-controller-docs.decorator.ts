import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiVerifiedAuthDocs } from '../../../../../common/decorators/docs/auth';
import {
  ApiChatIdParamDocs,
  ApiChatNotFoundResponseDocs,
} from '../../../docs/shared';

export function ChatMessageApiControllerDocs() {
  return applyDecorators(
    ApiTags('API ChatMessages'),
    ApiVerifiedAuthDocs(),
    ApiChatNotFoundResponseDocs(),
    ApiChatIdParamDocs(),
  );
}
