import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './product.repository';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../file/file.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { PaginatedProduct, ProductCategory } from './types/product.types';
import { SearchProductDto } from './dto/search-product.dto';
import { SortProductDto } from './dto/sort-product.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

  async getAll(
    paginationDto: PaginationDto,
    sortProductDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = paginationDto;

    const skip: number = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      this.productRepository.findAll(skip, pageSize, sortProductDto),
      this.productRepository.count(),
    ]);

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
    searchProductDto: SearchProductDto,
    paginationDto: PaginationDto,
    sortProductDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = paginationDto;
    const skip: number = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      this.productRepository.findProducts(
        searchProductDto,
        skip,
        pageSize,
        sortProductDto,
      ),
      this.productRepository.count(searchProductDto),
    ]);

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
    createProductDto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    const imagesNames: string[] = await this.fileService.createImages(images);

    return await this.productRepository.create(
      userId,
      createProductDto,
      imagesNames,
    );
  }

  async update(
    userId: number,
    productId: number,
    updateProductDto: UpdateProductDto,
    images?: Express.Multer.File[],
  ): Promise<ProductCategory> {
    await this.validateProductOwnership(userId, productId);

    try {
      let imagesNames: string[] = [];

      if (images && images.length > 0) {
        imagesNames = await this.fileService.createImages(images);
      }

      return await this.productRepository.update(
        productId,
        updateProductDto,
        imagesNames,
      );
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        throw new NotFoundException('Product not found');
    }
  }

  async delete(userId: number, productId: number): Promise<void> {
    await this.validateProductOwnership(userId, productId);

    try {
      return await this.productRepository.delete(productId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        throw new NotFoundException('Product not found');
    }
  }

  async getCategoryProducts(
    categoryId: number,
    paginationDto: PaginationDto,
    sortProductDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = paginationDto;
    const skip: number = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      this.productRepository.findCategoryProducts(
        categoryId,
        skip,
        pageSize,
        sortProductDto,
      ),
      this.productRepository.countCategoryProducts(categoryId),
    ]);

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
    paginationDto: PaginationDto,
    sortProductDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = paginationDto;
    const skip: number = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      this.productRepository.findUserProducts(
        userId,
        skip,
        pageSize,
        sortProductDto,
      ),
      this.productRepository.countUserProducts(userId),
    ]);

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
