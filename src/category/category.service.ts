import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Category } from '@prisma/client';
import { SearchCategoryDto } from './dto/search-category.dto';
import { PaginatedCategory } from './type/category.type';
import { SortCategoryDto } from './dto/sort-category.dto';
import { instanceToInstance } from 'class-transformer';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) throw new NotFoundException('Category not found');

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.categoryRepository.create(createCategoryDto);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        throw new BadRequestException('Category already exists');
    }
  }

  async update(
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      return await this.categoryRepository.update(categoryId, updateCategoryDto);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        throw new NotFoundException('Category not found');
    }
  }

  async delete(categoryId: number): Promise<void> {
    try {
      await this.categoryRepository.delete(categoryId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        throw new NotFoundException('Category not found');
    }
  }
}
