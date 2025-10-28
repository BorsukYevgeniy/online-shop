import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Category } from '@prisma/client';
import { SearchCategoryDto } from './dto/search-category.dto';
import { PaginatedCategory } from './type/category.type';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../../common/enum/role.enum';
import { SortCategoryDto } from './dto/sort-category.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('API Categories')
@Controller('api/categories')
export class CategoryApiController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get all categories or search category' })
  @ApiOkResponse({ description: 'Categories fetched' })
  @ApiBadRequestResponse({ description: 'Invalid query parametres' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SortCategoryDto })
  @ApiQuery({ type: SearchCategoryDto })
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getAll(
    @Query() pagination: PaginationDto,
    @Query() sortDto: SortCategoryDto,
    @Query() searchDto: SearchCategoryDto,
  ): Promise<PaginatedCategory> {
    return await this.categoryService.getAll(pagination, sortDto, searchDto);
  }

  @ApiOperation({ summary: 'Get category by id' })
  @ApiOkResponse({ description: 'Category fetched' })
  @ApiParam({ name: 'categoryId', type: Number })
  @Get(':categoryId')
  @UseInterceptors(CacheInterceptor)
  async getById(
    @Param('categoryId', ParseIntPipe) id: number,
  ): Promise<Category> {
    return await this.categoryService.getById(id);
  }

  @ApiOperation({ summary: 'Create category' })
  @ApiOkResponse({ description: 'Category created' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be an administrator' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiCookieAuth('accessToken')
  @Post()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.create(dto);
  }

  @ApiOperation({ summary: 'Update category' })
  @ApiOkResponse({ description: 'Category updated' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be an administrator' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiParam({ name: 'categoryId', type: Number })
  @ApiCookieAuth('accessToken')
  @Patch(':categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('categoryId', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete category' })
  @ApiNoContentResponse({ description: 'Category deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be an administrator' })
  @ApiParam({ name: 'categoryId', type: Number })
  @ApiCookieAuth('accessToken')
  @Delete(':categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('categoryId', ParseIntPipe) id: number): Promise<void> {
    return await this.categoryService.delete(id);
  }
}
