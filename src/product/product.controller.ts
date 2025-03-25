import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Param,
  Query,
  Body,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { ValidateProductDtoPipe } from './pipe/validate-product-filter.pipe';
import { ProductService } from './product.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import {AuthRequest} from '../types/request.type';
import { PaginatedProduct, ProductCategory } from './types/product.types';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedProduct> {
    return await this.productService.getAll(paginationDto);
  }

  @Get('search')
  async search(
    @Query(ValidateProductDtoPipe) dto: SearchProductDto,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedProduct> {
    return await this.productService.search(dto, pagination);
  }

  @Get(':productId')
  async getById(
    @Param('productId') productId: number,
  ): Promise<ProductCategory> {
    return await this.productService.getById(productId);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    return await this.productService.create(req.user.id, dto, images);
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async update(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProductDto,
    @Param('productId') productId: number,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<ProductCategory> {
    return await this.productService.update(
      req.user.id,
      productId,
      dto,
      images,
    );
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async delete(
    @Req() req: AuthRequest,
    @Param('productId') productId: number,
  ): Promise<void> {
    return await this.productService.delete(req.user.id, productId);
  }
}
