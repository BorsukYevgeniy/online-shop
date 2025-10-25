import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Res,
  Req,
  UseGuards,
  UseFilters,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Tokens } from '../token/interface/token.interfaces';
import { AuthRequest } from '../common/types/request.type';
import { AuthGuard } from './guards/jwt-auth.guard';
import { SsrExceptionFilter } from '../common/filter/ssr-exception.filter';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('SSR Auth')
@Controller('auth')
@UseFilters(SsrExceptionFilter)
export class AuthSsrController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Render register page' })
  @Get('register')
  @Render('auth/registration')
  async showRegisterForm() {
    return {};
  }

  @ApiOperation({ summary: 'Register user' })
  @ApiCreatedResponse({ description: 'User registered' })
  @ApiBadRequestResponse({
    description:
      'Invalid request body or user with same creadentials alredy exists',
  })
  @ApiBody({ type: CreateUserDto })
  @Post('register')
  async handleRegister(@Body() dto: CreateUserDto, @Res() res: Response) {
    const { accessToken, refreshToken }: Tokens =
      await this.authService.register(dto, 'ssr');

    res.cookie('accessToken', accessToken, {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.redirect('/users/me');
  }

  @ApiOperation({ summary: 'Render login page' })
  @Get('login')
  @Render('auth/login')
  async showLoginForm() {
    return {};
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({ description: 'User loggined' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBody({ type: LoginUserDto })
  @Post('login')
  async handleLogin(@Body() dto: LoginUserDto, @Res() res: Response) {
    const { accessToken, refreshToken }: Tokens =
      await this.authService.login(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.redirect('/users/me');
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiNoContentResponse({ description: 'User logouted' })
  @ApiCookieAuth('accessToken')
  @Post('logout')
  @UseGuards(AuthGuard)
  async handleLogout(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.logout(req.cookies['refreshToken']);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.redirect('/');
  }

  @ApiOperation({ summary: 'Logout user in all devices' })
  @ApiNoContentResponse({ description: 'User logouted' })
  @ApiCookieAuth('accessToken')
  @Post('logout-all')
  @UseGuards(AuthGuard)
  async handleLogoutAll(@Req() req: AuthRequest, @Res() res: Response) {
    await this.authService.logoutAll(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.redirect('/');
  }

  @ApiOperation({ summary: 'Render verify page' })
  @Get('verify/:link')
  @Render('auth/verification')
  async getVerifyPage(@Param('link') link: string) {
    return { link };
  }

  @ApiOperation({ summary: 'Verify user' })
  @ApiOkResponse({ description: 'User verified' })
  @ApiBadRequestResponse({ description: 'User already verified' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'link', type: String })
  @Post('verify/:link')
  async verifyUser(@Res() res: Response, @Param('link') link: string) {
    await this.authService.verifyUser(link);

    res.redirect('/users/me');
  }

  @ApiOperation({ summary: 'Render check yout email page' })
  @Get('check-your-email')
  @UseGuards(AuthGuard)
  @Render('email/check-your-email')
  async getCheckEmailPage() {}

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiNoContentResponse({ description: 'Email sended' })
  @ApiBadRequestResponse({ description: 'User already verified' })
  @ApiCookieAuth('accessToken')
  @Post('resend-email')
  @UseGuards(AuthGuard)
  async handleResendEmail(@Req() req: AuthRequest, @Res() res: Response) {
    await this.authService.resendVerificationMail(req.user.id, 'ssr');

    res.redirect('/auth/check-your-email');
  }
}
