import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';

export function AuthCookiesDocs() {
  return applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiCookieAuth('refreshToken'),
  );
}
