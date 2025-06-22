import {
  ForbiddenException,
  Injectable,
  Logger,
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

import { ProductErrorMessages as ProductErrMsg } from './enum/product-error-messages.enum';

@Injectable()
export class ProductService {
  private readonly logger: Logger = new Logger(ProductService.name);

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
      this.logger.warn(
        `User ${userId} tried to access a product ${productId} that does not exist`,
      );
      throw new NotFoundException(ProductErrMsg.ProductNotFound);
    }

    if (product.userId !== userId) {
      this.logger.warn(
        `User ${userId} tried to access a product ${productId} that does not belong to them`,
      );
      throw new ForbiddenException();
    }

    this.logger.log(
      `User ${userId} access to the product ${productId} is allowed`,
    );
  }

  async getAll(
    paginationDto: PaginationDto,
    sortDto: SortProductDto,
    searchDto: SearchProductDto,
  ): Promise<PaginatedProduct> {
    const { pageSize, page }: PaginationDto = paginationDto;

    const skip: number = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      this.productRepository.findAll(skip, pageSize, sortDto, searchDto),
      this.productRepository.count(searchDto),
    ]);

    const totalPages: number = Math.ceil(total / pageSize);

    this.logger.log('Products fetched successfully, total: ' + total);

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

    if (!product) {
      this.logger.warn(`Product ${productId} doesnt exist`);
      throw new NotFoundException(ProductErrMsg.ProductNotFound);
    }

    this.logger.log(`Product ${productId} fetched successfully`);
    return product;
  }

  async create(
    userId: number,
    createProductDto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    const imagesNames: string[] = await this.fileService.createImages(images);

    const product = await this.productRepository.create(
      userId,
      createProductDto,
      imagesNames,
    );

    this.logger.log(
      `Product ${product.id} created successfully by user ${userId}`,
    );
    return product;
  }

  async update(
    userId: number,
    productId: number,
    updateProductDto: UpdateProductDto,
    images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    await this.validateProductOwnership(userId, productId);

    try {
      const imagesNames = await this.fileService.createImages(images);
      const product = await this.productRepository.update(
        productId,
        updateProductDto,
        imagesNames,
      );

      this.logger.log(
        `Product ${product.id} updated successfully by user ${userId}`,
      );
      return product;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Product ${productId} doesnt exist`);

        throw new NotFoundException(ProductErrMsg.ProductNotFound);
      }
    }
  }

  async delete(userId: number, productId: number): Promise<void> {
    await this.validateProductOwnership(userId, productId);

    try {
      await this.productRepository.delete(productId);
      this.logger.log(
        `Product ${productId} deleted successfully by user ${userId}`,
      );
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Product ${productId} doesnt exist`);
        throw new NotFoundException(ProductErrMsg.ProductNotFound);
      }
    }
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

    this.logger.log(
      `Products fetched successfully for user ${userId}, total: ${total}`,
    );

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
