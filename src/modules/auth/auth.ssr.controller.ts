import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../common/decorators/routes/user.decorator';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
import { AuthRequest } from '../../common/types/request.type';
import { TokenPayload, Tokens } from '../token/interface/token.interfaces';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthSsrControllerDocs, AuthSsrRoutesDocs } from './docs/ssr';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/jwt-auth.guard';

@AuthSsrControllerDocs()
@Controller('auth')
@UseFilters(SsrExceptionFilter)
export class AuthSsrController {
  constructor(private readonly authService: AuthService) {}

  @AuthSsrRoutesDocs.RenderRegisterPage()
  @Get('register')
  @Render('auth/registration')
  async showRegisterForm() {
    return {};
  }

  @AuthSsrRoutesDocs.HandleRegister()
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

  @AuthSsrRoutesDocs.RenderLoginPage()
  @Get('login')
  @Render('auth/login')
  async showLoginForm() {
    return {};
  }

  @AuthSsrRoutesDocs.HandleLogin()
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

  @AuthSsrRoutesDocs.HandleLogout()
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

  @AuthSsrRoutesDocs.HandleLogoutAll()
  @Post('logout-all')
  @UseGuards(AuthGuard)
  async handleLogoutAll(@User() user: TokenPayload, @Res() res: Response) {
    await this.authService.logoutAll(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.redirect('/');
  }

  @AuthSsrRoutesDocs.RenderVerifyPage()
  @Get('verify/:link')
  @Render('auth/verification')
  async getVerifyPage(@Param('link') link: string) {
    return { link };
  }

  @AuthSsrRoutesDocs.HandleVerify()
  @Post('verify/:link')
  async verifyUser(@Res() res: Response, @Param('link') link: string) {
    await this.authService.verifyUser(link);

    res.redirect('/users/me');
  }

  @AuthSsrRoutesDocs.RenderCheckEmailPage()
  @Get('check-your-email')
  @UseGuards(AuthGuard)
  @Render('email/check-your-email')
  async getCheckEmailPage() {}

  @AuthSsrRoutesDocs.HandleResendEmail()
  @Post('resend-email')
  @UseGuards(AuthGuard)
  async handleResendEmail(@User() user: TokenPayload, @Res() res: Response) {
    await this.authService.resendVerificationMail(user.id, 'ssr');

    res.redirect('/auth/check-your-email');
  }
}
