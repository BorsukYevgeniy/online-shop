import { ApiSeeOtherResponse } from '@nestjs/swagger';

export function ApiRedirectResponse(url: string) {
  return ApiSeeOtherResponse({
    description: 'Redirects to '.concat(url),
  });
}
