import { ApiTags } from '@nestjs/swagger';

export function AuthApiControllerDocs() {
  return ApiTags('API Auth');
}
