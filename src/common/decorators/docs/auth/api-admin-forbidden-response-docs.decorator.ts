import { ApiForbiddenResponse } from '@nestjs/swagger';

export function ApiAdminForbiddenResponseDocs() {
  return ApiForbiddenResponse({
    description: 'You must be an administator to access this resource',
  });
}
