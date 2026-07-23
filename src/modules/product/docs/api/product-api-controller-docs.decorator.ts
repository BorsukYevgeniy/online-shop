import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ProductApiControllerDocs() {
  return applyDecorators(ApiTags('API Products'));
}
