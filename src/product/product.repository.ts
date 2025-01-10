import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilter } from './interface/product-filter.interface';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: ProductFilter) {
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
  ): Promise<Product[]> {
    const { title, minPrice, maxPrice }: ProductFilter = filter;

    return await this.prismaService.product.findMany({
      where: {
        title: { contains: title, mode: 'insensitive' },
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      skip,
      take: limit,
    });
  }

  async findById(productId: number): Promise<Product | null> {
    return await this.prismaService.product.findUnique({
      where: { id: productId },
    });
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    imageNames: string[],
  ): Promise<Product> {
    return await this.prismaService.product.create({
      data: { userId, ...dto, images: imageNames, price: Number(dto.price) },
    });
  }

  async update(
    productId: number,
    dto: UpdateProductDto,
    imageNames: string[],
  ): Promise<Product | null> {
    const updateData: any = {};

    if (dto.title) updateData.title = dto.title;
    if (dto.description) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = Number(dto.price);

    if (imageNames.length > 0) {
      updateData.images = imageNames;
    }

    return await this.prismaService.product.update({
      where: { id: productId },
      data: updateData,
    });
  }

  async delete(productId: number): Promise<Product | null> {
    return await this.prismaService.product.delete({
      where: { id: productId },
    });
  }
}
