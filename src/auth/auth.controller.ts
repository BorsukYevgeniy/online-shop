import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  @Post('registration')
  async registraion(@Body() dto: CreateUserDto){
    return await this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: CreateUserDto){
    return await this.authService.login(dto)
  }

}
