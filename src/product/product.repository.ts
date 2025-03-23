import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilter } from './types/product-filter.interface';
import { ProductCategory } from './types/product.types';
import { SearchProductDto } from './dto/search-product.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countCategoryProducts(categoryId: number): Promise<number> {
    return await this.prisma.product.count({
      where: { categories: { some: { id: categoryId } } },
    });
  }
  async countUserProducts(userId: number): Promise<number> {
    return await this.prisma.product.count({
      where: { userId },
    });
  }

  async count(filter?: ProductFilter): Promise<number> {
    return await this.prisma.product.count({
      where: {
        title: { contains: filter?.title, mode: 'insensitive' },
        price: {
          gte: filter?.minPrice,
          lte: filter?.maxPrice,
        },
      },
    });
  }

  async findAll(skip: number, limit: number): Promise<Product[]> {
    return await this.prisma.product.findMany({
      skip,
      take: limit,
    });
  }

  async findProducts(
    searchProductDto: SearchProductDto,
    skip: number,
    limit: number,
  ): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: {
        title: { contains: searchProductDto.title , mode: 'insensitive' },
        price: {
          gte: searchProductDto.minPrice,
          lte: searchProductDto.maxPrice,
        },
        categories: { some: { id: { in: searchProductDto.categoryIds } } },
      },
      skip,
      take: limit,
    });
  }

  async findCategoryProducts(
    categoryId: number,
    skip: number,
    limit: number,
  ): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: { categories: { some: { id: categoryId } } },
      skip,
      take: limit,
    });
  }

  async findUserProducts(
    userId: number,
    skip: number,
    limit: number,
  ): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: { userId },
      skip,
      take: limit,
    });
  }

  async findById(productId: number): Promise<ProductCategory> {
    return await this.prisma.product.findUnique({
      where: { id: productId },
      include: { categories: true },
    });
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    imageNames: string[],
  ): Promise<ProductCategory> {
    return await this.prisma.product.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        images: imageNames,
        price: dto.price,
        categories: {
          connect: dto.categoryIds.map((id) => ({ id })),
        },
      },
      include: { categories: true },
    });
  }

  async update(
    productId: number,
    dto: UpdateProductDto,
    imageNames?: string[],
  ): Promise<ProductCategory | null> {
    return await this.prisma.product.update({
      where: { id: productId },
      data: {
        images: imageNames,
        price: dto.price,
        description: dto.description,
        title: dto.title,
        categories: { set: dto.categoryIds?.map((id) => ({ id })) },
      },
      include: { categories: true },
    });
  }

  async delete(productId: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id: productId },
    });
  }
}
