import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles-auth.decorator';
import { AuthRequest } from '../interface/express-requests.interface';
import { UserWithProductsAndRolesWithoutPassword } from './types/user.types';
import { Product } from '@prisma/client';
import { PaginationDto } from '../dto/pagination.dto';
import { ParsePaginationDtoPipe } from '../pipe/parse-pagination-dto.pipe';
import { UserFilter } from './types/user-filter.type';
import { ParseUserFilterPipe } from './pipe/parse-user-filter.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async findAll(
    @Query(ParsePaginationDtoPipe) paginationDto: PaginationDto,
    @Query(ParseUserFilterPipe) userFilter: UserFilter,
  ) {
    return await this.userService.findAll(paginationDto, userFilter);
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
