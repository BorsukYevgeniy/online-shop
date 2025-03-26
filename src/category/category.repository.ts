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
    limit: number,
    sortDto?: SortCategoryDto,
  ): Promise<Category[]> {
    return await this.prisma.category.findMany({
      skip,
      take: limit,
      orderBy: { [sortDto.sortBy]: sortDto.order },
    });
  }

  async findById(id: number): Promise<Category> {
    return await this.prisma.category.findUnique({ where: { id } });
  }

  async findByName(
    name: string,
    skip: number,
    limit: number,
    sortDto?: SortCategoryDto,
  ): Promise<Category[]> {
    return await this.prisma.category.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      skip,
      take: limit,
      orderBy: { [sortDto.sortBy]: sortDto.order },
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return await this.prisma.category.create({ data: createCategoryDto });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
