import { ApiNotFoundResponse } from '@nestjs/swagger';

export function ApiUserNotFoundResponseDocs() {
  return ApiNotFoundResponse({ description: 'User not found' });
}
