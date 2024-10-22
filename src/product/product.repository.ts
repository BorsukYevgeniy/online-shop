import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products: Product[] = await this.prismaService.product.findMany({});
    return products;
  }

  async findUserProducts(userId: number): Promise<Product[] | null> {
    const products = await this.prismaService.product.findMany({
      where: { userId },
    });
    return products;
  }

  async create(userId: number, dto: CreateProductDto) {
    const product = await this.prismaService.product.create({
      data: { ...dto, userId },
    });
    return product;
  }
}
