import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async count(): Promise<number> {
    return await this.prisma.category.count();
  }

  async findAll(skip: number, limit: number): Promise<Category[]> {
    return await this.prisma.category.findMany({ skip, take: limit });
  }

  async findOne(categoryId: number): Promise<Category> {
    return await this.prisma.category.findUnique({ where: { id: categoryId } });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return await this.prisma.category.create({ data: dto });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    return await this.prisma.category.update({ where: { id }, data: dto });
  }

  async delete(id: number): Promise<Category> {
    return await this.prisma.category.delete({ where: { id } });
  }
}
