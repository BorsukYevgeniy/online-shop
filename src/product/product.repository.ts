import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products: Product[] = await this.prismaService.product.findMany({});
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

  async create(userId: number, dto: CreateProductDto , image: string[]): Promise<Product> {
    const product: Product = await this.prismaService.product.create({
      data: { ...dto, price: Number(dto.price), userId, photos: image },
    });
    return product;
  }

  async update(productId: number, dto: UpdateProductDto): Promise<Product> {
    const product: Product | null = await this.prismaService.product.update({
      where: { id: productId },
      data: dto,
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
