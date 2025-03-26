import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { SortCategoryDto } from './dto/sort-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async count(name?: string): Promise<number> {
    return await this.prisma.category.count({
      where: {
        name: { contains: name, mode: 'insensitive' },
      },
    });
  }

  async findAll(
    skip: number,
    take: number,
    sortDto?: SortCategoryDto,
  ): Promise<Category[]> {
    return await this.prisma.category.findMany({
      skip,
      take,
      orderBy: { [sortDto.sortBy]: sortDto.order },
    });
  }

  async findById(categoryId: number): Promise<Category> {
    return await this.prisma.category.findUnique({ where: { id: categoryId } });
  }

  async findByName(
    categoryName: string,
    skip: number,
    take: number,
    sortCategoryDto?: SortCategoryDto,
  ): Promise<Category[]> {
    return await this.prisma.category.findMany({
      where: { name: { contains: categoryName, mode: 'insensitive' } },
      skip,
      take,
      orderBy: { [sortCategoryDto.sortBy]: sortCategoryDto.order },
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return await this.prisma.category.create({ data: createCategoryDto });
  }

  async update(
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: updateCategoryDto,
    });
  }

  async delete(categoryId: number): Promise<void> {
    await this.prisma.category.delete({ where: { id: categoryId } });
  }
}
