import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import { AuthApiRoutesDocs } from '../api/auth-api-routes-docs';

export class AuthSsrRoutesDocs {
  static RenderRegisterPage() {
    return ApiOperation({ summary: 'Render register page' });
  }

  static HandleRegister() {
    return applyDecorators(
      AuthApiRoutesDocs.Register(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /users/me',
      }),
    );
  }

  static RenderLoginPage() {
    return ApiOperation({ summary: 'Render login page' });
  }

  static HandleLogin() {
    return applyDecorators(
      AuthApiRoutesDocs.Login(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /users/me',
      }),
    );
  }

  static HandleLogout() {
    return applyDecorators(
      AuthApiRoutesDocs.Logout(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /',
      }),
    );
  }

  static HandleLogoutAll() {
    return applyDecorators(
      AuthApiRoutesDocs.LogoutAll(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /',
      }),
    );
  }

  static RenderVerifyPage() {
    return ApiOperation({ summary: 'Render verify page' });
  }

  static HandleVerify() {
    return applyDecorators(
      AuthApiRoutesDocs.Verify(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /users/me',
      }),
    );
  }
  static HandleResendEmail() {
    return applyDecorators(
      AuthApiRoutesDocs.ResendEmail(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /auth/check-your-email',
      }),
    );
  }

  static RenderCheckEmailPage() {
    return ApiOperation({ summary: 'Render check your email page' });
  }
}
