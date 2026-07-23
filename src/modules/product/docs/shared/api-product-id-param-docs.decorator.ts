import { ApiParam } from '@nestjs/swagger';

export function ApiProductIdParamDocs() {
  return ApiParam({ name: 'productId', type: Number });
}
