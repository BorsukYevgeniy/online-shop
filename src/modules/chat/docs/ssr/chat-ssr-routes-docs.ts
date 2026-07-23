import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ChatApiRoutesDocs } from '../api';

export class ChatSsrRoutesDocs {
  static HandleCreateChat() {
    return applyDecorators(
      ChatApiRoutesDocs.Create(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /chats/:chatId',
      }),
    );
  }

  static HandleDeleteChat() {
    return applyDecorators(
      ChatApiRoutesDocs.Delete(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /chats',
      }),
    );
  }

  static GetById = ChatApiRoutesDocs.GetById;
  static GetMyChats = ChatApiRoutesDocs.GetMyChats;
}
