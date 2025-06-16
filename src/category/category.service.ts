import {
  BadRequestException,
  Injectable,
  Logger,
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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { CategoryErrorMessages as CategoryErrMsg } from './enum/category-error-messages.enum';

@Injectable()
export class CategoryService {
  private readonly logger: Logger = new Logger(CategoryService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAllCategories() {
    return await this.categoryRepository.findAllCategories();
  }

  async getAll(
    paginationDto: PaginationDto,
    sortDto: SortCategoryDto,
    searchDto: SearchCategoryDto,
  ): Promise<PaginatedCategory> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      this.categoryRepository.findAll(skip, pageSize, sortDto, searchDto),
      this.categoryRepository.count(searchDto),
    ]);

    const totalPages: number = Math.ceil(total / pageSize);

    this.logger.log('Categories fetched successfully, total: ' + total);

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

    if (!category) {
      this.logger.warn(`Category ${categoryId} doesnt exist`);
      throw new NotFoundException(CategoryErrMsg.CategoryNotFound);
    }

    this.logger.log(`Category ${categoryId} fetched successfully`);
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryRepository.create(createCategoryDto);

      this.logger.log(
        `Category created successfully, name: ${createCategoryDto.name}`,
      );

      return category;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(
          'Category already exists, name: ' + createCategoryDto.name,
        );
        throw new BadRequestException(CategoryErrMsg.CategoryAlreadyExists);
      }
    }
  }

  async update(
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const category = await this.categoryRepository.update(
        categoryId,
        updateCategoryDto,
      );

      this.logger.log(`Category ${categoryId} updated successfully `);
      return category;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Category ${categoryId} doesnt exist`);
        throw new NotFoundException(CategoryErrMsg.CategoryNotFound);
      }
    }
  }

  async delete(categoryId: number): Promise<void> {
    try {
      await this.categoryRepository.delete(categoryId);

      this.logger.log(`Category deleted successfully, id: ${categoryId}`);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Category ${categoryId} doesnt exist`);

        throw new NotFoundException(CategoryErrMsg.CategoryNotFound);
      }
    }
  }
}
