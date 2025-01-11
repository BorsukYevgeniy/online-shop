import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilter } from './types/product-filter.interface';
import { ProductCategory } from './types/product.type';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: ProductFilter): Promise<number> {
    const { title, minPrice, maxPrice }: ProductFilter = filter;

    return await this.prismaService.product.count({
      where: {
        title: { contains: title, mode: 'insensitive' },
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    });
  }

  async findAll(
    filter: ProductFilter,
    skip: number,
    limit: number,
  ): Promise<ProductCategory[]> {
    const { title, minPrice, maxPrice }: ProductFilter = filter;

    return await this.prismaService.product.findMany({
      where: {
        title: { contains: title, mode: 'insensitive' },
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      include: { categories: true },
      skip,
      take: limit,
    });
  }

  async findById(productId: number): Promise<ProductCategory> {
    return await this.prismaService.product.findUnique({
      where: { id: productId },
      include: { categories: true },
    });
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    imageNames: string[],
  ): Promise<ProductCategory> {
    return await this.prismaService.product.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        images: imageNames,
        price: Number(dto.price),
        categories: {
          connect: dto.categoryIds.map((id) => ({ id: Number(id) })),
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
    return await this.prismaService.product.update({
      where: { id: productId },
      data: {
        images: imageNames,
        price: dto.price,
        description: dto.description,
        title: dto.title,
        categories: dto.categoryIds
          ? { set: dto.categoryIds.map((c) => ({ id: Number(c) })) }
          : undefined,
      },
      include: { categories: true },
    });
  }

  async delete(productId: number): Promise<ProductCategory | null> {
    return await this.prismaService.product.delete({
      where: { id: productId },
      include: { categories: true },
    });
  }
}
