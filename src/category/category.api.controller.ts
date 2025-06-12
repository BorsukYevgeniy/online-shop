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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { PaginationDto } from '../dto/pagination.dto';
import { Category } from '@prisma/client';
import { SearchCategoryDto } from './dto/search-category.dto';
import { PaginatedCategory } from './type/category.type';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../enum/role.enum';
import { SortCategoryDto } from './dto/sort-category.dto';

@Controller('api/categories')
export class CategoryApiController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAll(
    @Query() pagination: PaginationDto,
    @Query() sortDto: SortCategoryDto,
    @Query() searchDto: SearchCategoryDto,
  ): Promise<PaginatedCategory> {
    return await this.categoryService.getAll(pagination, sortDto, searchDto);
  }

  @Get(':categoryId')
  async getById(@Param('categoryId') id: number): Promise<Category> {
    return await this.categoryService.getById(id);
  }

  @Post()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.create(dto);
  }

  @Patch(':categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('categoryId') id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':categoryId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('categoryId') id: number): Promise<void> {
    return await this.categoryService.delete(id);
  }
}
