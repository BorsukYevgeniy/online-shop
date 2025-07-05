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
import { AuthRequest } from '../types/request.type';
import { AuthGuard } from './guards/jwt-auth.guard';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';

@Controller('auth')
@UseFilters(SsrExceptionFilter)
export class AuthSsrController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  @Render('auth/registration')
  async showRegisterForm() {
    return {};
  }

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

  @Get('login')
  @Render('auth/login')
  async showLoginForm() {
    return {};
  }

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

  @Post('logout-all')
  @UseGuards(AuthGuard)
  async handleLogoutAll(@Req() req: AuthRequest, @Res() res: Response) {
    await this.authService.logoutAll(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.redirect('/');
  }

  @Get('verify/:link')
  @Render('auth/verification')
  async getVerifyPage(@Param('link') link: string) {
    return { link };
  }

  @Post('verify/:link')
  async verifyUser(@Res() res: Response, @Param('link') link: string) {
    await this.authService.verifyUser(link);

    res.redirect('/users/me');
  }
}
