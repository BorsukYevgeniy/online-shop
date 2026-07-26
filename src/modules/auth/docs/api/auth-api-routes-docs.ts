import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiAuthDocs } from '../../../../common/decorators/docs/auth';
import { ApiUserNotFoundResponseDocs } from '../../../user/docs/shared';
import { CreateUserDto } from '../../../user/dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';

export class AuthApiRoutesDocs {
  static Register() {
    return applyDecorators(
      ApiOperation({ summary: 'Register user' }),
      ApiCreatedResponse({ description: 'User registered' }),
      ApiBadRequestResponse({
        description: 'Email or password are incorrect',
      }),
      ApiBody({ type: CreateUserDto }),
    );
  }

  static Login() {
    return applyDecorators(
      ApiOperation({ summary: 'Login user' }),
      ApiOkResponse({ description: 'User loggined' }),
      ApiBadRequestResponse({ description: 'Login or password are invalid' }),
      ApiBody({ type: LoginUserDto }),
    );
  }

  static Logout() {
    return applyDecorators(
      ApiAuthDocs(),
      ApiOperation({ summary: 'Logout user' }),
      ApiNoContentResponse({ description: 'User logouted' }),
    );
  }

  static LogoutAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Logout user in all devices' }),
      ApiNoContentResponse({ description: 'User logouted' }),
      ApiAuthDocs(),
    );
  }

  static Refresh() {
    return applyDecorators(
      ApiOperation({ summary: 'Refresh pair of tokens' }),
      ApiOkResponse({ description: 'Tokens refreshed' }),
      ApiUnauthorizedResponse({ description: 'Refresh token not found' }),
    );
  }

  static Verify() {
    return applyDecorators(
      ApiOperation({ summary: 'Verify user' }),
      ApiOkResponse({ description: 'User verified' }),
      ApiConflictResponse({ description: 'User already verified' }),
      ApiUserNotFoundResponseDocs(),
      ApiParam({ name: 'link', type: String }),
    );
  }

  static ResendEmail() {
    return applyDecorators(
      ApiOperation({ summary: 'Resend verification email' }),
      ApiNoContentResponse({ description: 'Email sended' }),
      ApiConflictResponse({ description: 'User already verified' }),
      ApiAuthDocs(),
    );
  }
}
