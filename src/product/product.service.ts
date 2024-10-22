import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './product.repository';
import { Product } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async findUserProduct(userId: number): Promise<Product[] | null> {
    return await this.productRepository.findUserProducts(userId);
  }

  async create(userId: number, dto: CreateProductDto): Promise<Product> {
    return await this.productRepository.create(userId, dto);
  }
}
