import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  ApiAdminForbiddenResponseDocs,
  ApiVerifiedForbiddenResponseDocs,
} from '../../../../../common/decorators/docs/auth';
import { CreateMessageDto } from '../../../../message/dto/create-message.dto';

export class ChatMessageApiRoutesDocs {
  static GetAllMessages() {
    return applyDecorators(
      ApiOperation({ summary: 'Get messages in chat' }),
      ApiOkResponse({ description: 'Messages fetched' }),
      ApiAdminForbiddenResponseDocs(),
    );
  }

  static CreatMessage() {
    return applyDecorators(
      ApiOperation({ summary: 'Create message in chat' }),
      ApiOkResponse({ description: 'Message created' }),
      ApiVerifiedForbiddenResponseDocs(),
      ApiForbiddenResponse({
        description: 'You must be a participant of the chat',
      }),
      ApiBody({ type: CreateMessageDto }),
    );
  }
}
