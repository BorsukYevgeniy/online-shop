import {
  Controller,
  Get,
  Render,
  Req,
  Res,
  UseGuards,
  Param,
  Query,
  Delete,
  Patch,
  UseFilters,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../types/request.type';
import { UserService } from './user.service';
import { ProductService } from '../product/product.service';
import { PaginationDto } from '../dto/pagination.dto';
import { SortProductDto } from '../product/dto/sort-product.dto';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { Response } from 'express';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../enum/role.enum';
import { SearchUserDto } from './dto/search-user.dto';
import { SortUserDto } from './dto/sort-user.dto';
import { ValidateUserFilterPipe } from './pipe/validate-user-filter.pipe';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';

@Controller('users')
@UseFilters(SsrExceptionFilter)
export class UserSsrController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @Get('')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
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
      currentPage: pagination.page,
      currentSize: pagination.pageSize,
    };
  }

  @Get('search')
  @UseGuards(AuthGuard)
  @Render('users/search-user')
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
      currentPage: pagination.page,
      currentSize: pagination.pageSize,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @Render('users/user-account')
  async getUserAccountPage(@Req() req: AuthRequest) {
    const user = await this.userService.getMe(req.user.id);

    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      isVerified: user.isVerified,
      verifiedAt: user.verifiedAt,
    };
  }

  @Get(':userId')
  @Render('users/get-user-by-id')
  @UseGuards(AuthGuard)
  async getUserByIdPage(
    @Param('userId') userId: number,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    const user = await this.userService.getById(userId);

    if (userId === req.user.id) return res.redirect('/users/me');

    return { ...user, guestRole: req.user.role };
  }

  @Get(':userId/products')
  @UseGuards(VerifiedUserGuard)
  @Render('users/my-products')
  async getUserProducts(
    @Req() req: AuthRequest,
    @Param('userId') userId: number,
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
      guestId: req.user.id,
      currentPage: paginationDto.page,
      currentSize: paginationDto.pageSize,
    };
  }

  @Patch('assing-admin/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async assignAdmin(@Res() res: Response, @Param('userId') userId: number) {
    await this.userService.assignAdmin(userId);

    res.redirect(`/users/${userId}`);
  }

  @Delete('delete/me')
  @UseGuards(AuthGuard)
  async handleDeleteUserByHimself(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    await this.userService.delete(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.redirect('/');
  }

  @Delete('delete/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleDeleteUserAdmin(
    @Param('userId') userId: number,
    @Res() res: Response,
  ) {
    await this.userService.delete(userId);

    return res.redirect('/');
  }
}
