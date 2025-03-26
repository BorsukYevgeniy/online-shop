import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Category } from '@prisma/client';
import { SearchCategoryDto } from './dto/search-category.dto';
import { PaginatedCategory } from './type/category.type';
import { SortCategoryDto } from './dto/sort-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAll(pagination: PaginationDto, sortDto?: SortCategoryDto): Promise<PaginatedCategory> {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      this.categoryRepository.findAll(skip, pageSize, sortDto),
      this.categoryRepository.count(),
    ]);

    const totalPages: number = Math.ceil(total / pageSize);

    return {
      categories,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async search(
    dto: SearchCategoryDto,
    pagination: PaginationDto,
    sortDto?: SortCategoryDto,
  ): Promise<PaginatedCategory> {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      this.categoryRepository.findByName(dto.name, skip, pageSize, sortDto),
      this.categoryRepository.count(dto.name),
    ]);

    const totalPages: number = Math.ceil(total / pageSize);

    return {
      categories,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getById(id: number): Promise<Category> {
    return this.categoryRepository.findById(id);
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(dto);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    return this.categoryRepository.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    return this.categoryRepository.delete(id);
  }
}
