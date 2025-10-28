import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Render,
  UseGuards,
  Res,
  Query,
  Body,
  UseFilters,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { SortCategoryDto } from './dto/sort-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchCategoryDto } from './dto/search-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../../common/enum/role.enum';
import { Response } from 'express';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { User } from '../../common/decorators/routes/user.decorator';
import { TokenPayload } from '../token/interface/token.interfaces';

@ApiTags('SSR Categories')
@Controller('categories')
@UseFilters(SsrExceptionFilter)
export class CategorySsrController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiOkResponse({ description: 'Categories fetched' })
  @ApiBadRequestResponse({ description: 'Invalid query parametres' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SortCategoryDto })
  @ApiQuery({ type: SearchCategoryDto })
  @ApiCookieAuth('accessToken')
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

  @ApiOperation({ summary: 'Search category' })
  @ApiOkResponse({ description: 'Categories fetched' })
  @ApiBadRequestResponse({ description: 'Invalid query parametres' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SortCategoryDto })
  @ApiQuery({ type: SearchCategoryDto })
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

  @ApiOperation({ summary: 'Render create category page' })
  @ApiCookieAuth('accessToken')
  @Get('create')
  @Render('categories/create-category')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getCreateCategoryPage() {}

  @ApiOperation({ summary: 'Create category' })
  @ApiOkResponse({ description: 'Category created' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be an administrator' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiCookieAuth('accessToken')
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

  @ApiOperation({ summary: 'Get category by id' })
  @ApiOkResponse({ description: 'Category fetched' })
  @ApiParam({ name: 'categoryId', type: Number })
  @ApiCookieAuth('accessToken')
  @Get(':categoryId')
  @UseGuards(AuthGuard)
  @Render('categories/get-category-by-id')
  @UseInterceptors(CacheInterceptor)
  async getCategoryByIdPage(
    @User() user: TokenPayload,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    const category = await this.categoryService.getById(Number(categoryId));

    return { ...category, role: user.role };
  }

  @ApiOperation({ summary: 'Render update category page' })
  @ApiCookieAuth('accessToken')
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

  @ApiOperation({ summary: 'Update category' })
  @ApiOkResponse({ description: 'Category updated' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be an administrator' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiParam({ name: 'categoryId', type: Number })
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

    res.redirect(`/categories/${categoryId}`);
  }

  @ApiOperation({ summary: 'Delete category' })
  @ApiNoContentResponse({ description: 'Category deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be an administrator' })
  @ApiParam({ name: 'categoryId', type: Number })
  @ApiCookieAuth('accessToken')
  @Delete('delete/:categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handleCategoryDelete(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Res() res: Response,
  ) {
    await this.categoryService.delete(categoryId);

    res.redirect('/categories');
  }
}
