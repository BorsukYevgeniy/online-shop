import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Category, Product } from '@prisma/client';
import { SearchCategoryDto } from './dto/search-category.dto';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(pagination: PaginationDto) {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = (page - 1) * pageSize;

    const total: number = await this.categoryRepository.count();
    const totalPages: number = Math.ceil(total / pageSize);

    const categories: Category[] = await this.categoryRepository.findAll(
      skip,
      pageSize,
    );

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

  async searchCategory(dto: SearchCategoryDto, pagination: PaginationDto) {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = (page - 1) * pageSize;

    const total: number = await this.categoryRepository.count(dto.name);
    const totalPages: number = Math.ceil(total / pageSize);

    const categories: Category[] = await this.categoryRepository.findByName(
      dto.name,
      skip,
      pageSize,
    );

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

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOne(id);
  }

  async findCategoryProducts(id: number, pagination: PaginationDto) {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = (page - 1) * pageSize;

    const products: Product[] =
      await this.categoryRepository.findCategoryProducts(id, skip, pageSize);

    const total: number =
      await this.categoryRepository.countProductsInCategory(id);
      
    const totalPages: number = Math.ceil(total / pageSize);

    return {
      products,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(dto);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    return this.categoryRepository.update(id, dto);
  }

  async remove(id: number): Promise<Category> {
    return this.categoryRepository.delete(id);
  }
}
