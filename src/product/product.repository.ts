import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategory } from './types/product.types';
import { SearchProductDto } from './dto/search-product.dto';
import { Product } from '@prisma/client';
import { SortProductDto } from './dto/sort-product.dto';

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

  async count(filter?: SearchProductDto): Promise<number> {
    return await this.prisma.product.count({
      where: {
        title: { contains: filter?.title, mode: 'insensitive' },
        price: {
          gte: filter?.minPrice,
          lte: filter?.maxPrice,
        },
        categories: { some: { id: { in: filter?.categoryIds } } },
      },
    });
  }

  async findAll(
    skip: number,
    take: number,
    sortDto: SortProductDto,
  ): Promise<Product[]> {
    return await this.prisma.product.findMany({
      skip,
      take,
      orderBy: { [sortDto.sortBy]: sortDto.order },
    });
  }

  async findProducts(
    searchProductDto: SearchProductDto,
    skip: number,
    take: number,
    sortDto: SortProductDto,
  ): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: {
        title: { contains: searchProductDto.title, mode: 'insensitive' },
        price: {
          gte: searchProductDto.minPrice,
          lte: searchProductDto.maxPrice,
        },
        categories: { some: { id: { in: searchProductDto.categoryIds } } },
      },
      orderBy: { [sortDto.sortBy]: sortDto.order },
      skip,
      take,
    });
  }

  async findCategoryProducts(
    categoryId: number,
    skip: number,
    take: number,
    sortDto: SortProductDto,
  ): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: { categories: { some: { id: categoryId } } },
      orderBy: { [sortDto.sortBy]: sortDto.order },
      skip,
      take,
    });
  }

  async findUserProducts(
    userId: number,
    skip: number,
    limit: number,
    sortDto?: SortProductDto,
  ): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: { userId },
      orderBy: { [sortDto.sortBy]: sortDto.order },
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
