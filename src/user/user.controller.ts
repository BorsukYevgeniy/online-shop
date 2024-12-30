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
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles-auth.decorator';
import { AuthRequest } from '../interface/express-requests.interface';
import {
  UsersWithProductsAndRolesWithoutPassword,
  UserWithProductsAndRolesWithoutPassword,
} from './types/user.types';
import { Product } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async findAll(): Promise<UsersWithProductsAndRolesWithoutPassword> {
    return await this.userService.findAll();
  }

  @Get(':userId')
  async findUserById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword> {
    return await this.userService.findById(userId);
  }

  @Get(':userId/products')
  async findUserProductsById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Product[]> {
    return await this.userService.findUserProducts(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @Delete('')
  @UseGuards(AuthGuard)
  async deleteUserById(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    const deletedUser: UserWithProductsAndRolesWithoutPassword =
      await this.userService.delete(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.send(deletedUser);
  }

  // Видалення акаунту адміністратором
  @Delete(':userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteUserByIdByAdmin(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword> {
    return await this.userService.delete(userId);
  }
}
