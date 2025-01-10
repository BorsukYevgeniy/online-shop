import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Request, Response } from 'express';
import { AuthRequest } from '../interfaces/express-requests.interface';
import { Tokens } from '../token/interface/token.interfaces';
import { UserRolesNoPassword } from '../user/types/user.types';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  async registraion(@Body() dto: CreateUserDto): Promise<UserRolesNoPassword> {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res() res: Response): Promise<void> {
    const { accessToken, refreshToken }: Tokens =
      await this.authService.login(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send('Loggined succesfully');
  }

  @Post('logout')
  async logout(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.authService.logout(req.cookies['refreshToken']);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.send({ message: 'Logouted succesfully' });
  }

  @Post('logout-all')
  @UseGuards(AuthGuard)
  async logoutAll(@Req() req: AuthRequest, @Res() res: Response) {
    await this.authService.logoutAll(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.send({ message: 'Logouted in all devices' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken: string = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const newTokens: Tokens = await this.authService.refreshToken(refreshToken);

    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 60 minutes
    });
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({ message: 'Token refreshed' });
  }
}
