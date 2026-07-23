import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '../../common/enum/role.enum';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { SearchCategoryDto } from './dto/search-category.dto';
import { SortCategoryDto } from './dto/sort-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginatedCategory } from './type/category.type';

import { CategoryApiControllerDocs, CategoryApiRoutesDocs } from './docs/api';

@CategoryApiControllerDocs()
@Controller('api/categories')
export class CategoryApiController {
  constructor(private readonly categoryService: CategoryService) {}

  @CategoryApiRoutesDocs.GetAll()
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getAll(
    @Query() pagination: PaginationDto,
    @Query() sortDto: SortCategoryDto,
    @Query() searchDto: SearchCategoryDto,
  ): Promise<PaginatedCategory> {
    return await this.categoryService.getAll(pagination, sortDto, searchDto);
  }

  @CategoryApiRoutesDocs.GetById()
  @Get(':categoryId')
  @UseInterceptors(CacheInterceptor)
  async getById(
    @Param('categoryId', ParseIntPipe) id: number,
  ): Promise<Category> {
    return await this.categoryService.getById(id);
  }

  @CategoryApiRoutesDocs.Create()
  @Post()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.create(dto);
  }

  @CategoryApiRoutesDocs.Update()
  @Patch(':categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('categoryId', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @CategoryApiRoutesDocs.DeleteById()
  @Delete(':categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('categoryId', ParseIntPipe) id: number): Promise<void> {
    return await this.categoryService.delete(id);
  }
}
