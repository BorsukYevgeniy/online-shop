import {
  Controller,
  Get,
  Render,
  Res,
  UseGuards,
  UseInterceptors,
  Param,
  Query,
  Delete,
  Patch,
  UseFilters,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../common/types/request.type';
import { UserService } from './user.service';
import { ProductService } from '../product/product.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SortProductDto } from '../product/dto/sort-product.dto';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { Response } from 'express';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../common/enum/role.enum';
import { SearchUserDto } from './dto/search-user.dto';
import { SortUserDto } from './dto/sort-user.dto';
import { ValidateUserFilterPipe } from './pipe/validate-user-filter.pipe';
import { SsrExceptionFilter } from '../common/filter/ssr-exception.filter';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ChatService } from '../chat/chat.service';

import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
  ApiParam,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiCookieAuth,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { User } from '../decorators/routes/user.decorator';
import { TokenPayload } from '../token/interface/token.interfaces';

@ApiTags('SSR Users')
@ApiCookieAuth('accessToken')
@Controller('users')
@UseGuards(AuthGuard)
@UseFilters(SsrExceptionFilter)
export class UserSsrController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly chatService: ChatService,
  ) {}

  @ApiOperation({ summary: 'Getting all users' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiBadRequestResponse({ description: 'Ivalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SortUserDto })
  @Get()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  @Render('users/get-all-users')
  async getAllUsersPage(
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortUserDto,
  ) {
    const { users, ...pagination } = await this.userService.getAll(
      paginationDto,
      sortDto,
      {},
    );

    return {
      users,
      ...pagination,
      ...sortDto,
    };
  }

  @ApiOperation({ summary: 'Searching users' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiBadRequestResponse({ description: 'Ivalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SearchUserDto })
  @ApiQuery({ type: SortUserDto })
  @Get('search')
  @Render('users/search-user')
  @UseInterceptors(CacheInterceptor)
  async getSearchUserPage(
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortUserDto,
    @Query(ValidateUserFilterPipe) searchDto: SearchUserDto,
  ) {
    const { users, ...pagination } = await this.userService.getAll(
      paginationDto,
      sortDto,
      searchDto,
    );

    return {
      users: searchDto.nickname ? users : [],
      ...pagination,
      ...sortDto,
    };
  }

  @ApiOperation({ summary: 'Getting my account' })
  @ApiOkResponse({ description: 'User fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('me')
  @Render('users/user-account')
  @UseInterceptors(CacheInterceptor)
  async getUserAccountPage(@User() user: TokenPayload) {
    return await this.userService.getMe(user.id);
  }

  @ApiOperation({ summary: 'Getting user by id' })
  @ApiOkResponse({ description: 'Users fetched' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'userId', type: Number })
  @Get(':userId')
  @Render('users/get-user-by-id')
  @UseInterceptors(CacheInterceptor)
  async getUserByIdPage(
    @Param('userId', ParseIntPipe) userId: number,
    @User() userFromReq: TokenPayload,
    @Res() res: Response,
  ) {
    const user = await this.userService.getById(userId);

    const chatBeetweenUsers = await this.chatService.findChatBetweenUsers(
      userId,
      userFromReq.id,
    );

    if (userId === userFromReq.id) return res.redirect('/users/me');

    return {
      ...user,
      guestRole: userFromReq.role,
      guestId: userFromReq.id,
      chatId: chatBeetweenUsers?.id,
    };
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
  @Render('users/my-products')
  async getUserProducts(
    @User() user: TokenPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortProductDto,
  ) {
    const { nickname } = await this.userService.getById(userId);
    const { products, ...pagination } =
      await this.productService.getUserProducts(userId, paginationDto, sortDto);

    return {
      nickname,
      products: products,
      ...pagination,
      ...sortDto,
      guestId: user.id,
    };
  }

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
    @Res() res: Response,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    await this.userService.assignAdmin(userId);

    res.redirect(`/users/${userId}`);
  }

  @ApiOperation({ summary: 'Deleting user by id as ownership of account' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('me')
  @Delete('delete/me')
  async handleDeleteUserByHimself(
    @User() user: TokenPayload,
    @Res() res: Response,
  ) {
    await this.userService.delete(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.redirect('/');
  }

  @ApiOperation({ summary: 'Deleting user by id as admin' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('me')
  @Delete('delete/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleDeleteUserAdmin(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    await this.userService.delete(userId);

    return res.redirect('/');
  }
}
