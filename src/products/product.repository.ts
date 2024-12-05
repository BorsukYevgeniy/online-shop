import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
          gte: minPrice ?? undefined,
          lte: maxPrice ?? undefined,
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
    images: string[],
  ): Promise<Product> {
    const product: Product = await this.prismaService.product.create({
      data: { ...dto, price: Number(dto.price), userId, images },
    });
    return product;
  }

  async update(
    productId: number,
    dto: UpdateProductDto,
    images: string[],
  ): Promise<Product> {
    const product: Product | null = await this.prismaService.product.update({
      where: { id: productId },
      data: { ...dto, price: Number(dto.price), images },
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
