import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateMessageDto } from '../dto/update-message.dto';

export class MessageApiRoutesDocs {
  static GetMessageById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get message by id' }),
      ApiOkResponse({ description: 'Message fetched' }),
    );
  }

  static Update() {
    return applyDecorators(
      ApiOperation({ summary: 'Update message by id' }),
      ApiOkResponse({ description: 'Message updated' }),
      ApiBody({ type: UpdateMessageDto }),
    );
  }

  static Delete() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete message by id' }),
      ApiNoContentResponse({ description: 'Message deleted' }),
    );
  }
}
