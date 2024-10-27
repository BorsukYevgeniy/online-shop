import { Controller, Post, Body, Res, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  async registraion(@Body() dto: CreateUserDto) {
    return await this.authService.register(dto);
  }
  @Post('login')
  async login(
    @Body() dto: CreateUserDto,
    @Res() res: Response,
  ) {
    console.log()
    const { accessToken, refreshToken } = await this.authService.login(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send("Loggined succesfully")
  }
  @Post('refresh')
  async refresh(@Body('refreshToken') token: string,
  @Req() req: Request,
@Res() res: Response) {
  const refresh = req.cookies['refreshToken'];
  if (!refresh) {
    throw new BadRequestException("Refresh token not found");
  }



    const newTokens = await this.authService.refreshToken(token);
  
    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 хвилин
    });
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
    });

    res.send({ message: 'Token refreshed' });
  
  }
}
