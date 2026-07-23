import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiVerifiedForbiddenResponseDocs } from '../../../../common/decorators/docs/auth';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { CreateChatDto } from '../../dto/create-chat.dto';
import { ApiChatIdParamDocs, ApiChatNotFoundResponseDocs } from '../shared';

export class ChatApiRoutesDocs {
  static GetMyChats() {
    return applyDecorators(
      ApiOperation({ summary: 'Fetch my chats' }),
      ApiOkResponse({ description: 'Chats fetched' }),
    );
  }

  static GetById() {
    return applyDecorators(
      ApiOperation({ summary: 'Fetch chat by id' }),
      ApiOkResponse({ description: 'Chat fetched' }),
      ApiForbiddenResponse({ description: 'You isnt participant of chat' }),
      ApiChatNotFoundResponseDocs(),
      ApiChatIdParamDocs(),
      ApiQuery({ type: PaginationDto }),
    );
  }

  static Create() {
    return applyDecorators(
      ApiOperation({ summary: 'Fetch chat by id' }),
      ApiOkResponse({ description: 'Chat fetched' }),
      ApiBody({ type: CreateChatDto }),
    );
  }

  static Delete() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete chat by id' }),
      ApiOkResponse({ description: 'Chat deleted' }),
      ApiVerifiedForbiddenResponseDocs(),
      ApiForbiddenResponse({ description: 'You isnt participant of chat' }),
      ApiChatNotFoundResponseDocs(),
      ApiChatIdParamDocs(),
    );
  }
}
