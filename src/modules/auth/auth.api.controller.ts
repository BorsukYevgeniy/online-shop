import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenPayload, Tokens } from '../token/interface/token.interfaces';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/jwt-auth.guard';

import { TokenErrorMessages as TokenErrMsg } from '../token/enum/token-error-messages.enum';

import { User } from '../../common/decorators/routes/user.decorator';
import { AuthRequest } from '../../common/types/request.type';
import { AuthApiControllerDocs, AuthApiRoutesDocs } from './docs/api';

@AuthApiControllerDocs()
@Controller('api/auth')
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @AuthApiRoutesDocs.Register()
  @Post('register')
  async registration(
    @Res() res: Response,
    @Body() dto: CreateUserDto,
  ): Promise<void> {
    const { accessToken, refreshToken }: Tokens =
      await this.authService.register(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send('Registered succesfully');
  }

  @AuthApiRoutesDocs.Login()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginUserDto, @Res() res: Response): Promise<void> {
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

    res.send('Loggined succesfully');
  }

  @AuthApiRoutesDocs.Logout()
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.authService.logout(req.cookies['refreshToken']);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  @AuthApiRoutesDocs.LogoutAll()
  @UseGuards(AuthGuard)
  @Post('logout-all')
  @HttpCode(204)
  async logoutAll(@User() user: TokenPayload, @Res() res: Response) {
    await this.authService.logoutAll(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  @AuthApiRoutesDocs.Refresh()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken: string = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException(TokenErrMsg.RefreshTokenIsMissing);
    }

    const newTokens: Tokens = await this.authService.refreshToken(refreshToken);

    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({ message: 'Token refreshed' });
  }

  @AuthApiRoutesDocs.Verify()
  @Post('verify/:link')
  @HttpCode(200)
  async verify(@Param('link') link: string) {
    await this.authService.verifyUser(link);

    return { message: 'User verified succesfully' };
  }

  @AuthApiRoutesDocs.ResendEmail()
  @Post('resend-email')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async resendEmail(@User() user: TokenPayload) {
    return await this.authService.resendVerificationMail(user.id);
  }
}
