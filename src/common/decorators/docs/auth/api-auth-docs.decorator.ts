import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthDocs() {
  return applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiCookieAuth('refreshToken'),
    ApiUnauthorizedResponse({
      description: 'You must be authorized to access this resource',
    }),
  );
}
