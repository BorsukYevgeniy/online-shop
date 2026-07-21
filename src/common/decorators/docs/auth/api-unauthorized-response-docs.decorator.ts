import { ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiUnauthorizedResponseDocs() {
  return ApiUnauthorizedResponse({
    description: 'You must be authorized to access this resource',
  });
}
