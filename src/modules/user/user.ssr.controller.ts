import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Render,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '../../common/enum/role.enum';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { ChatService } from '../chat/chat.service';
import { SortProductDto } from '../product/dto/sort-product.dto';
import { ProductService } from '../product/product.service';
import { SearchUserDto } from './dto/search-user.dto';
import { SortUserDto } from './dto/sort-user.dto';
import { ValidateUserFilterPipe } from './pipe/validate-user-filter.pipe';
import { UserService } from './user.service';

import { User } from '../../common/decorators/routes/user.decorator';
import { TokenPayload } from '../token/interface/token.interfaces';
import { UserSsrRoutesDocs } from './docs/ssr/user-ssr-routes-docs';
import { UserSsrControllerDocs } from './docs/ssr/users-ssr-controller-docs.decorator';

@UserSsrControllerDocs()
@Controller('users')
@UseGuards(AuthGuard)
@UseFilters(SsrExceptionFilter)
export class UserSsrController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly chatService: ChatService,
  ) {}

  @UserSsrRoutesDocs.GetAll()
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

  @UserSsrRoutesDocs.Search()
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

  @UserSsrRoutesDocs.GetMe()
  @Get('me')
  @Render('users/user-account')
  @UseInterceptors(CacheInterceptor)
  async getUserAccountPage(@User() user: TokenPayload) {
    return await this.userService.getMe(user.id);
  }

  @UserSsrRoutesDocs.GetById()
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

    if (userId === userFromReq.id) return res.redirect(303, '/users/me');

    return {
      ...user,
      guestRole: userFromReq.role,
      guestId: userFromReq.id,
      chatId: chatBeetweenUsers?.id,
    };
  }

  @UserSsrRoutesDocs.GetUserProducts()
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

  @UserSsrRoutesDocs.HandleAssignAdmin()
  @Patch('assing-admin/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async assignAdmin(
    @Res() res: Response,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    await this.userService.assignAdmin(userId);

    res.redirect(303, `/users/${userId}`);
  }

  @UserSsrRoutesDocs.HandleDeleteMe()
  @Delete('delete/me')
  async handleDeleteUserByHimself(
    @User() user: TokenPayload,
    @Res() res: Response,
  ) {
    await this.userService.delete(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.redirect(303, '/');
  }

  @UserSsrRoutesDocs.HandleDeleteById()
  @Delete('delete/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleDeleteUserAdmin(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    await this.userService.delete(userId);

    return res.redirect(303, '/');
  }
}
