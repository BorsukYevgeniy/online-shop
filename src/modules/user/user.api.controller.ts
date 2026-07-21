import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../common/decorators/routes/user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '../../common/enum/role.enum';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { SortProductDto } from '../product/dto/sort-product.dto';
import { ProductService } from '../product/product.service';
import { PaginatedProduct } from '../product/types/product.types';
import { TokenPayload } from '../token/interface/token.interfaces';
import { UserApiControllerDocs, UserApiRoutesDocs } from './docs/api';
import { SearchUserDto } from './dto/search-user.dto';
import { SortUserDto } from './dto/sort-user.dto';
import { ValidateUserFilterPipe } from './pipe/validate-user-filter.pipe';
import {
  PaginatedUserNoCreds,
  UserNoCred,
  UserNoPasswordVLink,
} from './types/user.types';
import { UserService } from './user.service';

@UserApiControllerDocs()
@Controller('api/users')
@UseGuards(AuthGuard)
export class UserApiController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @UserApiRoutesDocs.GetAll()
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getAll(
    @Query(ValidateUserFilterPipe) searchDto: SearchUserDto,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    return await this.userService.getAll(paginationDto, sortDto, searchDto);
  }
  @UserApiRoutesDocs.GetMe()
  @Get('me')
  async getMe(@User() user: TokenPayload): Promise<UserNoPasswordVLink> {
    return await this.userService.getMe(user.id);
  }
  @UserApiRoutesDocs.GetById()
  @Get(':userId')
  @UseInterceptors(CacheInterceptor)
  async getById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserNoCred | void> {
    return await this.userService.getById(userId);
  }
  @UserApiRoutesDocs.GetUserProducts()
  @Get(':userId/products')
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(CacheInterceptor)
  async getUserProducts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    return await this.productService.getUserProducts(
      userId,
      paginationDto,
      sortDto,
    );
  }

  // Привоїти користувачу роль адміна
  @UserApiRoutesDocs.AssignAdmin()
  @Patch('assing-admin/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async assignAdmin(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserNoCred> {
    return await this.userService.assignAdmin(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @UserApiRoutesDocs.DeleteMe()
  @Delete('me')
  @HttpCode(204)
  async deleteMe(
    @User() user: TokenPayload,
    @Res() res: Response,
  ): Promise<void> {
    await this.userService.delete(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  // Видалення акаунту адміністратором
  @UserApiRoutesDocs.DeleteById()
  @Delete(':userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return await this.userService.delete(userId);
  }
}
