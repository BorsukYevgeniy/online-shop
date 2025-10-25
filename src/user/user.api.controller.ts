import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Res,
  Query,
  Patch,
  HttpCode,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Response } from 'express';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import {
  PaginatedUserNoCreds,
  UserNoPasswordVLink,
  UserNoCred,
} from './types/user.types';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { ValidateUserFilterPipe } from './pipe/validate-user-filter.pipe';
import { ProductService } from '../product/product.service';
import { PaginatedProduct } from '../product/types/product.types';
import { Role } from '../common/enum/role.enum';
import { SortUserDto } from './dto/sort-user.dto';
import { SortProductDto } from '../product/dto/sort-product.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { User } from '../common/decorators/routes/user.decorator';
import { TokenPayload } from '../token/interface/token.interfaces';

@ApiTags('API Users')
@ApiCookieAuth('accessToken')
@Controller('api/users')
@UseGuards(AuthGuard)
export class UserApiController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @ApiOperation({ summary: 'Getting all users or searching users' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Ivalid query parameters' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SearchUserDto })
  @ApiQuery({ type: SortUserDto })
  @Get()
  @UseInterceptors(CacheInterceptor)
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
  async getMe(@User() user: TokenPayload): Promise<UserNoPasswordVLink> {
    return await this.userService.getMe(user.id);
  }

  @ApiOperation({ summary: 'Getting user by id' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'userId', type: Number })
  @Get(':userId')
  @UseInterceptors(CacheInterceptor)
  async getById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserNoCred | void> {
    return await this.userService.getById(userId);
  }

  @ApiOperation({ summary: 'Getting product of user by id' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiBadRequestResponse({ description: 'Ivalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'userId', type: Number })
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
  @ApiOperation({ summary: 'Assinging admin by user id' })
  @ApiOkResponse({ description: 'Admin assigned' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'userId', type: Number })
  @Patch('assing-admin/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async assignAdmin(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserNoCred> {
    return await this.userService.assignAdmin(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @ApiOperation({ summary: 'Deleting user by id as ownership of account' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('me')
  @HttpCode(204)
  async deleteMe(@User() user: TokenPayload, @Res() res: Response): Promise<void> {
    await this.userService.delete(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  // Видалення акаунту адміністратором
  @ApiOperation({ summary: 'Deleting user by id as admin' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'userId', type: Number })
  @Delete(':userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return await this.userService.delete(userId);
  }
}
