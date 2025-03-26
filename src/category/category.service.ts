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

  async getAll(
    paginationDto: PaginationDto,
    sortCategoryDto?: SortCategoryDto,
  ): Promise<PaginatedCategory> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      this.categoryRepository.findAll(skip, pageSize, sortCategoryDto),
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
    searchCategoryDto: SearchCategoryDto,
    paginationDto: PaginationDto,
    sortCategoryDto?: SortCategoryDto,
  ): Promise<PaginatedCategory> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      this.categoryRepository.findByName(
        searchCategoryDto.name,
        skip,
        pageSize,
        sortCategoryDto,
      ),
      this.categoryRepository.count(searchCategoryDto.name),
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

  async getById(categoryId: number): Promise<Category> {
    return this.categoryRepository.findById(categoryId);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(createCategoryDto);
  }

  async update(
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryRepository.update(categoryId, updateCategoryDto);
  }

  async delete(categoryrId: number): Promise<void> {
    return this.categoryRepository.delete(categoryrId);
  }
}
