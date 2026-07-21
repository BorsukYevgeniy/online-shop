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
// import { AuthCookiesDocs } from '../../../../common/decorators/docs/auth';
import { CreateUserDto } from '../../../user/dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';

export class AuthApiRoutesDocs {
  static Register() {
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

  static Login() {
    return applyDecorators(
      ApiOperation({ summary: 'Login user' }),
      ApiOkResponse({ description: 'User loggined' }),
      ApiBadRequestResponse({ description: 'Invalid request body' }),
      ApiNotFoundResponse({ description: 'User not found' }),
      ApiBody({ type: LoginUserDto }),
    );
  }

  static Logout() {
    return applyDecorators(
      // AuthCookiesDocs(),
      ApiOperation({ summary: 'Logout user' }),
      ApiNoContentResponse({ description: 'User logouted' }),
    );
  }
  static LogoutAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Logout user in all devices' }),
      ApiNoContentResponse({ description: 'User logouted' }),
      // AuthCookiesDocs(),
    );
  }

  static Refresh() {
    return applyDecorators(
      ApiOperation({ summary: 'Refresh pair of tokens' }),
      ApiOkResponse({ description: 'Tokens refreshed' }),
      ApiBadRequestResponse({ description: 'Refresh token not found' }),
    );
  }

  static Verify() {
    return applyDecorators(
      ApiOperation({ summary: 'Verify user' }),
      ApiOkResponse({ description: 'User verified' }),
      ApiBadRequestResponse({ description: 'User already verified' }),
      ApiNotFoundResponse({ description: 'User not found' }),
      ApiParam({ name: 'link', type: String }),
    );
  }
  static ResendEmail() {
    return applyDecorators(
      ApiOperation({ summary: 'Resend verification email' }),
      ApiNoContentResponse({ description: 'Email sended' }),
      ApiBadRequestResponse({ description: 'User already verified' }),
      // AuthCookiesDocs(),
    );
  }
}
