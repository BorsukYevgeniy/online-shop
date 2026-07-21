import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

export function ErrorSsrControllerDocs() {
  return ApiTags('SSR Errors');
}

export function RenderErrorPageDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Render error page' }),
    ApiParam({ name: 'errorCode', type: Number, enum: [400, 403, 404, 500] }),
    ApiQuery({ name: 'message', type: String }),
  );
}
