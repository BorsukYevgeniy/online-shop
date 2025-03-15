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
  PaginatedUserRolesNoCreds,
  UserRolesNoPassword,
  UserRolesNoCreds,
} from './types/user.types';
import { Product } from '@prisma/client';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { ParseUserFilterPipe } from './pipe/parse-user-filter.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedUserRolesNoCreds> {
    return await this.userService.getAll(paginationDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: AuthRequest): Promise<UserRolesNoPassword> {
    return await this.userService.getMe(req.user.id);
  }

  @Get('search')
  async search(
    @Query(ParseUserFilterPipe) dto: SearchUserDto,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedUserRolesNoCreds> {
    return await this.userService.search(dto, pagination);
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  async getById(
    @Param('userId') userId: number,
  ): Promise<UserRolesNoCreds | void> {
    return await this.userService.getById(userId);
  }

  @Get(':userId/products')
  async getUserProducts(@Param('userId') userId: number): Promise<Product[]> {
    return await this.userService.getUserProducts(userId);
  }

  // Привоїти користувачу роль адміна
  @Patch('assing-admin/:userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async assignAdmin(
    @Param('userId') userId: number,
  ): Promise<UserRolesNoCreds> {
    return await this.userService.assignAdmin(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @Delete('me')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteMe(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.userService.delete(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return;
  }

  // Видалення акаунту адміністратором
  @Delete(':userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('userId') userId: number): Promise<void> {
    await this.userService.delete(userId);
    return;
  }
}
