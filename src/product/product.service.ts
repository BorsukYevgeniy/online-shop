import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './product.repository';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository,
  ) {}

  private async validateProductOwnership(
    userId: number,
    productId: number,
  ): Promise<Product> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException();
    }
    return product;
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async findById(productId: number): Promise<Product | null> {
    return await this.productRepository.findById(productId);
  }

  async findUserProduct(userId: number): Promise<Product[] | null> {
    return await this.productRepository.findUserProducts(userId);
  }

  async create(userId: number, dto: CreateProductDto,file): Promise<Product> {
    //const fileName = await this.fileService.createFile(file)
    
    return await this.productRepository.create(userId, dto, file);
  }

  async updateProduct(
    userId: number,
    productId: number,
    dto: UpdateProductDto,
  ): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    return await this.productRepository.update(productId, dto);
  }

  async deleteProduct(userId: number, productId: number): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    return await this.productRepository.delete(productId);
  }
}
