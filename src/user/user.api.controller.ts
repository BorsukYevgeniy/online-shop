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
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Response } from 'express';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { AuthRequest } from '../types/request.type';
import {
  PaginatedUserNoCreds,
  UserNoPasswordVLink,
  UserNoCred,
} from './types/user.types';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { ValidateUserFilterPipe } from './pipe/validate-user-filter.pipe';
import { ProductService } from '../product/product.service';
import { PaginatedProduct } from '../product/types/product.types';
import { Role } from '../enum/role.enum';
import { SortUserDto } from './dto/sort-user.dto';
import { SortProductDto } from '../product/dto/sort-product.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiCookieAuth('accessToken')
@Controller('api/users')
export class UserApiController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @ApiOperation({ summary: 'Getting all users or searching users' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SearchUserDto })
  @ApiQuery({ type: SortUserDto })
  @Get()
  @UseInterceptors(CacheInterceptor)
  @UseGuards(AuthGuard)
  async getAll(
    @Query(ValidateUserFilterPipe) searchDto: SearchUserDto,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    return await this.userService.getAll(paginationDto, sortDto, searchDto);
  }

  @ApiOperation({ summary: 'Getting my account' })
  @ApiOkResponse({ description: 'User fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: AuthRequest): Promise<UserNoPasswordVLink> {
    return await this.userService.getMe(req.user.id);
  }

  @ApiOperation({ summary: 'Getting user by id' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'userId', type: Number })
  @Get(':userId')
  @UseInterceptors(CacheInterceptor)
  @UseGuards(AuthGuard)
  async getById(@Param('userId') userId: number): Promise<UserNoCred | void> {
    return await this.userService.getById(userId);
  }

  @ApiOperation({ summary: 'Getting product of user by id' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'userId', type: Number })
  @Get(':userId/products')
  @UseInterceptors(CacheInterceptor)
  @UseGuards(AuthGuard)
  async getUserProducts(
    @Param('userId') userId: number,
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
  @ApiOperation({ summary: 'Assinging admin by user id' })
  @ApiOkResponse({ description: 'Admin assigned' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'userId', type: Number })
  @Patch('assing-admin/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async assignAdmin(@Param('userId') userId: number): Promise<UserNoCred> {
    return await this.userService.assignAdmin(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @ApiOperation({ summary: 'Deleting user by id as ownership of account' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('me')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteMe(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.userService.delete(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  // Видалення акаунту адміністратором
  @ApiOperation({ summary: 'Deleting user by id as admin' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({description: 'User not found'})
  @ApiParam({ name: 'userId', type: Number })
  @Delete(':userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('userId') userId: number): Promise<void> {
    return await this.userService.delete(userId);
  }
}
