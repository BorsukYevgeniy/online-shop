import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Render,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { User } from '../../common/decorators/routes/user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '../../common/enum/role.enum';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { TokenPayload } from '../token/interface/token.interfaces';
import { CategoryService } from './category.service';
import { CategorySsrControllerDocs, CategorySsrRoutesDocs } from './docs/ssr';
import { CreateCategoryDto } from './dto/create-category.dto';
import { SearchCategoryDto } from './dto/search-category.dto';
import { SortCategoryDto } from './dto/sort-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@CategorySsrControllerDocs()
@Controller('categories')
@UseFilters(SsrExceptionFilter)
export class CategorySsrController {
  constructor(private readonly categoryService: CategoryService) {}

  @CategorySsrRoutesDocs.GetAll()
  @Get()
  @Render('categories/get-all-categories')
  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  async getAllCategoriesPage(
    @User() user: TokenPayload,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortCategoryDto,
  ) {
    const { categories, ...pagination } = await this.categoryService.getAll(
      paginationDto,
      sortDto,
      {},
    );

    return {
      categories,
      ...pagination,
      ...sortDto,
      role: user.role,
    };
  }

  @CategorySsrRoutesDocs.Search()
  @Get('search')
  @Render('categories/search-category')
  @UseInterceptors(CacheInterceptor)
  async getSearchCategoryPage(
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortCategoryDto,
    @Query() searchDto: SearchCategoryDto,
  ) {
    const { categories, ...pagination } = await this.categoryService.getAll(
      paginationDto,
      sortDto,
      searchDto,
    );

    return {
      categories: searchDto.name ? categories : [],
      ...pagination,
      ...sortDto,
    };
  }

  @CategorySsrRoutesDocs.GetById()
  @Get(':categoryId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Render('categories/get-category-by-id')
  async getCategoryByIdPage(
    @User() user: TokenPayload,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    const category = await this.categoryService.getById(Number(categoryId));

    return { ...category, role: user.role };
  }

  @CategorySsrRoutesDocs.RenderCreatePage()
  @Get('create')
  @Render('categories/create-category')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getCreateCategoryPage() {}

  @CategorySsrRoutesDocs.HandleCreate()
  @Post('create')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleCreateCategory(
    @Body() createDto: CreateCategoryDto,
    @Res() res: Response,
  ) {
    await this.categoryService.create(createDto);

    res.redirect(303, '/categories');
  }

  @CategorySsrRoutesDocs.RenderUpdatePage()
  @Get('update/:categoryId')
  @Render('categories/update-category')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  async getUpdateCategoryPage(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return await this.categoryService.getById(categoryId);
  }

  @CategorySsrRoutesDocs.HandleUpdate()
  @ApiCookieAuth('accessToken')
  @Patch('update/:categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleCategoryUpdate(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() updateDto: UpdateCategoryDto,
    @Res() res: Response,
  ) {
    await this.categoryService.update(categoryId, updateDto);

    res.redirect(303, `/categories/${categoryId}`);
  }

  @CategorySsrRoutesDocs.HandleDeleteById()
  @Delete('delete/:categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleCategoryDelete(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Res() res: Response,
  ) {
    await this.categoryService.delete(categoryId);

    res.redirect(303, '/categories');
  }
}
