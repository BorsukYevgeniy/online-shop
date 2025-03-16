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
import { ProductService } from '../product/product.service';
import { PaginatedCategory } from './type/category.type';
import { PaginatedProduct } from '../product/types/product.types';
import Roles from '../auth/decorator/roles-auth.decorator';
import Role from '../enum/role.enum';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  async getAll(@Query() pagination: PaginationDto): Promise<PaginatedCategory> {
    return await this.categoryService.getAll(pagination);
  }

  @Get('search')
  async search(
    @Query() searchCategoryDto: SearchCategoryDto,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedCategory> {
    return await this.categoryService.search(searchCategoryDto, paginationDto);
  }

  @Get(':categoryId')
  async getById(@Param('categoryId') id: number): Promise<Category> {
    return this.categoryService.getById(id);
  }

  @Get(':categoryId/products')
  async getCategoryProducts(
    @Param('categoryId') categoryId: number,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedProduct> {
    return await this.productService.getCategoryProducts(
      categoryId,
      pagination,
    );
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.create(dto);
  }

  @Patch(':categoryId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('categoryId') id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':categoryId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('categoryId') id: number): Promise<void> {
    return await this.categoryService.delete(id);
  }
}
