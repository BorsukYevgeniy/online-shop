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
import { Roles } from '../auth/decorator/roles-auth.decorator';
import { PaginationDto } from '../dto/pagination.dto';
import { Category } from '@prisma/client';
import { SearchCategoryDto } from './dto/search-category.dto';
import { ProductService } from '../product/product.service';
import { PaginatedCategory } from './type/category.type';
import { PaginatedProducts } from 'src/product/types/product.types';

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

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Category> {
    return this.categoryService.getById(id);
  }

  @Get(':id/products')
  async getCategoryProducts(
    @Param('id') categoryId: number,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedProducts> {
    return await this.productService.getCategoryProducts(
      categoryId,
      pagination,
    );
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('id') id: number): Promise<void> {
    await this.categoryService.delete(id);
    return;
  }
}
