import { ApiOperation } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import { AuthApiRoutesDocs } from '../api/auth-api-routes-docs';

import { ApiRedirectResponse } from '../../../../common/decorators/docs/routes';

export class AuthSsrRoutesDocs {
  static RenderRegisterPage() {
    return ApiOperation({ summary: 'Render register page' });
  }

  static HandleRegister() {
    return applyDecorators(
      AuthApiRoutesDocs.Register(),
      ApiRedirectResponse('/users/me'),
    );
  }

  static RenderLoginPage() {
    return ApiOperation({ summary: 'Render login page' });
  }

  static HandleLogin() {
    return applyDecorators(
      AuthApiRoutesDocs.Login(),
      ApiRedirectResponse('/users/me'),
    );
  }

  static HandleLogout() {
    return applyDecorators(
      AuthApiRoutesDocs.Logout(),
      ApiRedirectResponse('/'),
    );
  }

  static HandleLogoutAll() {
    return applyDecorators(
      AuthApiRoutesDocs.LogoutAll(),
      ApiRedirectResponse('/'),
    );
  }

  static RenderVerifyPage() {
    return ApiOperation({ summary: 'Render verify page' });
  }

  static HandleVerify() {
    return applyDecorators(
      AuthApiRoutesDocs.Verify(),
      ApiRedirectResponse('/users/me'),
    );
  }

  static HandleResendEmail() {
    return applyDecorators(
      AuthApiRoutesDocs.ResendEmail(),
      ApiRedirectResponse('/auth/check-your-email'),
    );
  }

  static RenderCheckEmailPage() {
    return ApiOperation({ summary: 'Render check your email page' });
  }
}
