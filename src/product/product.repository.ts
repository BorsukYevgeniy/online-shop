import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilter } from './interface/product-filter.interface';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filter: ProductFilter): Promise<Product[]> {
    const { title, minPrice, maxPrice } = filter;

    const products: Product[] = await this.prismaService.product.findMany({
      where: {
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    });
    return products;
  }

  async findById(productId: number): Promise<Product | null> {
    const product: Product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    return product;
  }

  async findUserProducts(userId: number): Promise<Product[] | null> {
    const products: Product[] | null =
      await this.prismaService.product.findMany({
        where: { userId },
      });
    return products;
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    imageNames: string[],
  ): Promise<Product> {
    const product: Product = await this.prismaService.product.create({
      data: { userId, ...dto, images: imageNames, price: Number(dto.price) },
    });
    return product;
  }
  async update(
    productId: number,
    dto: UpdateProductDto,
    imageNames: string[],
  ): Promise<Product> {
    const updateData: any = {};

    if (dto.title) updateData.title = dto.title;
    if (dto.description) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = Number(dto.price);

    if (imageNames.length > 0) {
      updateData.images = imageNames;
    }

    const product: Product | null = await this.prismaService.product.update({
      where: { id: productId },
      data: updateData,
    });

    return product;
  }

  async delete(productId: number): Promise<Product> {
    const product: Product | null = await this.prismaService.product.delete({
      where: { id: productId },
    });
    return product;
  }
}
