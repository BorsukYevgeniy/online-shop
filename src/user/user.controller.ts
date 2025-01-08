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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles-auth.decorator';
import { AuthRequest } from '../interfaces/express-requests.interface';
import {
  UserProductsRolesNoCreds,
  UserProductsRolesNoPassword,
} from './types/user.types';
import { Product } from '@prisma/client';
import { PaginationDto } from '../dto/pagination.dto';
import { ParsePaginationDtoPipe } from '../pipe/parse-pagination-dto.pipe';
import { ParseUserFilterPipe } from './pipe/parse-user-filter.pipe';
import { UserFilterDto } from './dto/user-filter.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async findAll(
    @Query(ParsePaginationDtoPipe) paginationDto: PaginationDto,
    @Query(ParseUserFilterPipe) userFilter: UserFilterDto,
  ) {
    return await this.userService.findAll(paginationDto, userFilter);
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  async findUserById(
    @Req() req: AuthRequest,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserProductsRolesNoPassword | UserProductsRolesNoCreds> {
    return await this.userService.findById(userId, req.user.id);
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
    const deletedUser: UserProductsRolesNoCreds =
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
  ): Promise<UserProductsRolesNoCreds> {
    return await this.userService.delete(userId);
  }
}
