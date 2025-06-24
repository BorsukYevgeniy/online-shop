import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Render,
  UseGuards,
  Req,
  Res,
  Query,
  Body,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../types/request.type';
import { SortCategoryDto } from './dto/sort-category.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchCategoryDto } from './dto/search-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../enum/role.enum';
import { Response } from 'express';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('categories')
@UseFilters(SsrExceptionFilter)
export class CategorySsrController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @Render('categories/get-all-categories')
  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  async getAllCategoriesPage(
    @Req() req: AuthRequest,
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
      currentPage: paginationDto.page,
      currentPageSize: paginationDto.pageSize,
      role: req.user.role,
    };
  }

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
      currentSize: paginationDto.pageSize,
      currentPage: paginationDto.page,
    };
  }

  @Get('create')
  @Render('categories/create-category')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getCreateCategoryPage() {}

  @Post('create')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleCreateCategory(
    @Body() createDto: CreateCategoryDto,
    @Res() res: Response,
  ) {
    await this.categoryService.create(createDto);

    res.redirect('/categories');
  }

  @Get(':categoryId')
  @UseGuards(AuthGuard)
  @Render('categories/get-category-by-id')
  @UseInterceptors(CacheInterceptor)
  async getCategoryByIdPage(
    @Req() req: AuthRequest,
    @Param('categoryId') categoryId: number,
  ) {
    const category = await this.categoryService.getById(Number(categoryId));

    return { ...category, role: req.user.role };
  }

  @Get('update/:categoryId')
  @Render('categories/update-category')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getUpdateCategoryPage(@Param('categoryId') categoryId: number) {
    return await this.categoryService.getById(categoryId);
  }

  @Patch('update/:categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleCategoryUpdate(
    @Param('categoryId') categoryId: number,
    @Body() updateDto: UpdateCategoryDto,
    @Res() res: Response,
  ) {
    await this.categoryService.update(categoryId, updateDto);

    res.redirect(`/categories/${categoryId}`);
  }

  @Delete('delete/:categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleCategoryDelete(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
  ) {
    await this.categoryService.delete(categoryId);

    res.redirect('/categories');
  }
}
