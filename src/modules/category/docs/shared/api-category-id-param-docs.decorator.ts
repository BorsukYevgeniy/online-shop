import { ApiParam } from '@nestjs/swagger';

export function ApiCategoryIdParamDocs() {
  return ApiParam({ name: 'categoryId', type: Number });
}
