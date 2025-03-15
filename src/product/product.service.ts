import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './product.repository';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../file/file.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { PaginatedProduct, ProductCategory } from './types/product.types';
import { SearchProductDto } from './dto/search-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fileService: FileService,
  ) {}

  private async validateProductOwnership(
    userId: number,
    productId: number,
  ): Promise<void> {
    const product: ProductCategory | null =
      await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException();
    }

    return;
  }

  async getAll(paginationDto: PaginationDto): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = paginationDto;

    const skip: number = (page - 1) * pageSize;

    const products: Product[] = await this.productRepository.findAll(
      skip,
      pageSize,
    );

    const total: number = await this.productRepository.count();
    const totalPages: number = Math.ceil(total / pageSize);

    return {
      products,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async search(
    dto: SearchProductDto,
    pagination: PaginationDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = pagination;

    const skip: number = (page - 1) * pageSize;

    const products: Product[] = await this.productRepository.findProducts(
      dto,
      skip,
      pageSize,
    );

    const total: number = await this.productRepository.count(dto);
    const totalPages: number = Math.ceil(total / pageSize);

    return {
      products,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getById(productId: number): Promise<ProductCategory> {
    const product: ProductCategory | null =
      await this.productRepository.findById(productId);

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    const imagesNames: string[] = await this.fileService.createImages(images);

    return await this.productRepository.create(userId, dto, imagesNames);
  }

  async update(
    userId: number,
    productId: number,
    dto: UpdateProductDto,
    images?: Express.Multer.File[],
  ): Promise<ProductCategory> {
    await this.validateProductOwnership(userId, productId);

    let imagesNames: string[] = [];

    if (images && images.length > 0) {
      imagesNames = await this.fileService.createImages(images);
    } else {
      imagesNames = [];
    }

    return await this.productRepository.update(productId, dto, imagesNames);
  }

  async delete(userId: number, productId: number): Promise<void> {
    await this.validateProductOwnership(userId, productId);

    return await this.productRepository.delete(productId);
  }

  async getCategoryProducts(
    categoryId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = pagination;
    const skip: number = (page - 1) * pageSize;

    const products: Product[] =
      await this.productRepository.findCategoryProducts(
        categoryId,
        skip,
        pageSize,
      );

    const total: number =
      await this.productRepository.countCategoryProducts(categoryId);
    const totalPages: number = Math.ceil(total / pageSize);

    return {
      products,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getUserProducts(
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = pagination;
    const skip: number = (page - 1) * pageSize;

    const products: Product[] =
      await this.productRepository.findUserProducts(
        userId,
        skip,
        pageSize,
      );

    const total: number =
      await this.productRepository.countUserProducts(userId);
    const totalPages: number = Math.ceil(total / pageSize);

    return {
      products,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }
}
