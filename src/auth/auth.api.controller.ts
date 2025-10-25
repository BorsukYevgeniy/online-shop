import {
  Controller,
  Post,
  Body,
  Res,
  BadRequestException,
  UseGuards,
  HttpCode,
  Param,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Request, Response } from 'express';
import { TokenPayload, Tokens } from '../token/interface/token.interfaces';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/jwt-auth.guard';

import { TokenErrorMessages as TokenErrMsg } from '../token/enum/token-error-messages.enum';

import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { User } from '../decorators/routes/user.decorator';
import { AuthRequest } from '../common/types/request.type';

@ApiTags('API Auth')
@Controller('api/auth')
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register user' })
  @ApiCreatedResponse({ description: 'User registered' })
  @ApiBadRequestResponse({
    description:
      'Invalid request body or user with same creadentials alredy exists',
  })
  @ApiBody({ type: CreateUserDto })
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

  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({ description: 'User loggined' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBody({ type: LoginUserDto })
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

  @ApiOperation({ summary: 'Logout user' })
  @ApiNoContentResponse({ description: 'User logouted' })
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.authService.logout(req.cookies['refreshToken']);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  @ApiOperation({ summary: 'Logout user in all devices' })
  @ApiNoContentResponse({ description: 'User logouted' })
  @ApiCookieAuth('accessToken')
  @Post('logout-all')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async logoutAll(@User() user: TokenPayload, @Res() res: Response) {
    await this.authService.logoutAll(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  @ApiOperation({ summary: 'Refresh pair of tokens' })
  @ApiOkResponse({ description: 'Tokens refreshed' })
  @ApiBadRequestResponse({ description: 'Refresh token not found' })
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

  @ApiOperation({ summary: 'Verify user' })
  @ApiOkResponse({ description: 'User verified' })
  @ApiBadRequestResponse({ description: 'User already verified' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'link', type: String })
  @Post('verify/:link')
  @HttpCode(200)
  async verify(@Param('link') link: string) {
    await this.authService.verifyUser(link);

    return { message: 'User verified succesfully' };
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiNoContentResponse({ description: 'Email sended' })
  @ApiBadRequestResponse({ description: 'User already verified' })
  @ApiCookieAuth('accessToken')
  @Post('resend-email')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async resendEmail(@User() user: TokenPayload) {
    return await this.authService.resendVerificationMail(user.id);
  }
}
