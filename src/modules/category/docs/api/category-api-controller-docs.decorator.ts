import { ApiTags } from '@nestjs/swagger';

export function CategoryApiControllerDocs() {
  return ApiTags('API Categories');
}
