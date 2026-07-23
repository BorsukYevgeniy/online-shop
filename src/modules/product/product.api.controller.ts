import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '../../common/decorators/routes/user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { TokenPayload } from '../token/interface/token.interfaces';

import { ProductApiControllerDocs, ProductApiRoutesDocs } from './docs/api';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { SortProductDto } from './dto/sort-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { ProductService } from './product.service';
import { PaginatedProduct, ProductCategory } from './types/product.types';

@ProductApiControllerDocs()
@Controller('api/products')
export class ProductApiController {
  constructor(private readonly productService: ProductService) {}

  @ProductApiRoutesDocs.GetAll()
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getAll(
    @Query() searchDto: SearchProductDto,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    return await this.productService.getAll(paginationDto, sortDto, searchDto);
  }

  @ProductApiRoutesDocs.GetById()
  @Get(':productId')
  @UseInterceptors(CacheInterceptor)
  async getById(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductCategory> {
    return await this.productService.getById(productId);
  }

  @ProductApiRoutesDocs.Create()
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  @Post()
  async create(
    @User() user: TokenPayload,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    return await this.productService.create(user.id, dto, images);
  }

  @ProductApiRoutesDocs.Update()
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  @Patch(':productId')
  async update(
    @User() user: TokenPayload,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    return await this.productService.update(user.id, productId, dto, images);
  }

  @ProductApiRoutesDocs.Delete()
  @UseGuards(VerifiedUserGuard)
  @HttpCode(204)
  @Delete(':productId')
  async delete(
    @User() user: TokenPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<void> {
    return await this.productService.delete(user.id, productId);
  }
}
