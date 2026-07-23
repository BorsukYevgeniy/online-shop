import { applyDecorators } from '@nestjs/common';
import { ApiRedirectResponse } from '../../../../common/decorators/docs/routes';
import { ChatApiRoutesDocs } from '../api';

export class ChatSsrRoutesDocs {
  static HandleCreateChat() {
    return applyDecorators(
      ChatApiRoutesDocs.Create(),
      ApiRedirectResponse('/chats/:chatId'),
    );
  }

  static HandleDeleteChat() {
    return applyDecorators(
      ChatApiRoutesDocs.Delete(),
      ApiRedirectResponse('/chats'),
    );
  }

  static GetById = ChatApiRoutesDocs.GetById;
  static GetMyChats = ChatApiRoutesDocs.GetMyChats;
}
