import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Res,
  Query,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles-auth.decorator';
import { AuthRequest } from '../types/request.type';
import {
  PaginatedUsersRolesNoProductsCreds,
  UserProductsRolesNoCreds,
  UserProductsRolesNoPassword,
  UserRolesNoProductsCreds,
} from './types/user.types';
import { Product } from '@prisma/client';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { ParseUserFilterPipe } from './pipe/parse-user-filter.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('assing-admin/:userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async assignAdmin(
    @Param('userId') userId: number,
  ): Promise<UserRolesNoProductsCreds> {
    return await this.userService.assignAdmin(userId);
  }

  @Get('')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedUsersRolesNoProductsCreds> {
    return await this.userService.findAll(paginationDto);
  }

  @Get('search')
  async searchUsers(
    @Query(ParseUserFilterPipe) dto: SearchUserDto,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedUsersRolesNoProductsCreds> {
    return await this.userService.searchUsers(dto, pagination);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async findUserProfile(
    @Req() req: AuthRequest,
  ): Promise<UserProductsRolesNoPassword> {
    return await this.userService.findUserProfile(req.user.id);
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  async findUserById(
    @Param('userId') userId: number,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<UserProductsRolesNoCreds | void> {
    if (userId === req.user.id) {
      return res.redirect('/api/users/profile');
    } else {
      const user = await this.userService.findById(userId);
      res.send(user);
    }
  }

  @Get(':userId/products')
  async findUserProductsById(
    @Param('userId') userId: number,
  ): Promise<Product[]> {
    return await this.userService.findUserProducts(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @Delete('me')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteUserById(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.userService.delete(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  // Видалення акаунту адміністратором
  @Delete(':userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async deleteUserByIdByAdmin(@Param('userId') userId: number): Promise<void> {
    await this.userService.delete(userId);
    return;
  }
}
