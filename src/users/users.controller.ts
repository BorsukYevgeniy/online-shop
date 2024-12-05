import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles-auth.guard';
import { AuthRequest } from 'src/interfaces/express-requests.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}
  @Get('')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':userId')
  async findUserById(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userService.findById(userId);
  }

  @Get(':userId/products')
  async findUserProductsById(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userService.findUserProducts(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @Delete('')
  @UseGuards(AuthGuard)
  async deleteUserById(@Req() req: AuthRequest, @Res() res: Response) {
    const deletedUser = await this.userService.delete(req.user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.send(deletedUser);
  }

  // Видалення акаунту адміністратором
  @Delete(':userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteUserByIdByAdmin(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userService.delete(userId);
  }
}
