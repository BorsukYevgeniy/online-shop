import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './product.repository';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../file/file.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ProductFilter } from './interface/product-filter.interface';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fileService: FileService,
  ) {}

  private async validateProductOwnership(
    userId: number,
    productId: number,
  ): Promise<Product> {
    const product: Product | null =
      await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException();
    }
    return product;
  }

  private async buildProductFilter(
    title?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<ProductFilter> {
    const newFilter: ProductFilter = {};

    if (title) {
      newFilter.title = title;
    }
    if (minPrice) {
      newFilter.minPrice = minPrice;
    }
    if (maxPrice) {
      newFilter.maxPrice = maxPrice;
    }

    return newFilter;
  }

  async findAll(filter: ProductFilter, paginationDto: PaginationDto) {
    let { pageSize, page }: PaginationDto = paginationDto;

    const skip: number = (page - 1) * pageSize;

    const productFilter: ProductFilter = await this.buildProductFilter(
      filter.title,
      filter.minPrice,
      filter.maxPrice,
    );

    const products: Product[] = await this.productRepository.findAll(
      productFilter,
      skip,
      pageSize,
    );

    const total: number = await this.productRepository.count(productFilter);
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

  async findById(productId: number): Promise<Product> {
    const product: Product | null =
      await this.productRepository.findById(productId);

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async findUserProducts(userId: number): Promise<Product[]> {
    const userProducts: Product[] | null =
      await this.productRepository.findUserProducts(userId);

    if (!userProducts) throw new NotFoundException('Products not found');

    return userProducts;
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<Product> {
    try {
      const imagesNames: string[] = await this.fileService.createImages(images);

      return await this.productRepository.create(userId, dto, imagesNames);
    } catch (e: unknown) {
      console.error(e);

      if (e instanceof PrismaClientKnownRequestError) {
        console.error(e);
        throw new BadRequestException(
          'Product with same name created.Please change the name!',
        );
      }
    }
  }

  async updateProduct(
    userId: number,
    productId: number,
    dto: UpdateProductDto,
    images?: Express.Multer.File[],
  ): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    let imagesNames: string[] = [];

    if (images && images.length > 0) {
      imagesNames = await this.fileService.createImages(images);
    } else {
      imagesNames = [];
    }

    return await this.productRepository.update(productId, dto, imagesNames);
  }

  async deleteProduct(userId: number, productId: number): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    return await this.productRepository.delete(productId);
  }
}
