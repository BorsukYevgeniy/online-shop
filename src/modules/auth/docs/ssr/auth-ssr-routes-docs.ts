import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../../user/dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';

import { AuthCookiesDocs } from '../../../../common/decorators/docs/auth';

export class AuthSsrRoutesDocs {
  static RenderRegisterPage() {
    return ApiOperation({ summary: 'Render register page' });
  }

  static HandleRegister() {
    return applyDecorators(
      ApiOperation({ summary: 'Register user' }),
      ApiCreatedResponse({ description: 'User registered' }),
      ApiBadRequestResponse({
        description:
          'Invalid request body or user with same creadentials alredy exists',
      }),
      ApiBody({ type: CreateUserDto }),
    );
  }

  static RenderLoginPage() {
    return ApiOperation({ summary: 'Render login page' });
  }

  static HandleLogin() {
    return applyDecorators(
      ApiOperation({ summary: 'Login user' }),
      ApiOkResponse({ description: 'User loggined' }),
      ApiBadRequestResponse({ description: 'Invalid request body' }),
      ApiNotFoundResponse({ description: 'User not found' }),
      ApiBody({ type: LoginUserDto }),
    );
  }

  static HandleLogout() {
    return applyDecorators(
      ApiOperation({ summary: 'Logout user' }),
      ApiNoContentResponse({ description: 'User logouted' }),
      AuthCookiesDocs(),
    );
  }
  static HandleLogoutAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Logout user in all devices' }),
      ApiNoContentResponse({ description: 'User logouted' }),
      AuthCookiesDocs(),
    );
  }

  static RenderVerifyPage() {
    return ApiOperation({ summary: 'Render verify page' });
  }

  static HandleVerifyUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Verify user' }),
      ApiOkResponse({ description: 'User verified' }),
      ApiBadRequestResponse({ description: 'User already verified' }),
      ApiNotFoundResponse({ description: 'User not found' }),
      ApiParam({ name: 'link', type: String }),
    );
  }

  static HandleResendEmail() {
    return applyDecorators(
      ApiOperation({ summary: 'Resend verification email' }),
      ApiNoContentResponse({ description: 'Email sended' }),
      ApiBadRequestResponse({ description: 'User already verified' }),
      AuthCookiesDocs(),
    );
  }
  static RenderCheckEmailPage() {
    return ApiOperation({ summary: 'Render check yout email page' });
  }
}
