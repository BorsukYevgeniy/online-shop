import { ApiNotFoundResponse } from '@nestjs/swagger';

export function ApiProductNotFoundResponse() {
  return ApiNotFoundResponse({ description: 'Product not found' });
}
