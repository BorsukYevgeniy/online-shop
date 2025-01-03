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
  ParseIntPipe,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { AuthRequest } from '../interface/express-requests.interface';
import { Product } from '@prisma/client';
import { PaginationDto } from '../dto/pagination.dto';
import { ProductFilter } from './interface/product-filter.interface';
import { ParsePaginationDtoPipe } from '../pipe/parse-pagination-dto.pipe';
import { ParseProductFilterPipe } from './pipe/parse-product-filter.pipe';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  async getAllProducts(
    @Query(ParsePaginationDtoPipe) paginationDto: PaginationDto,
    @Query(ParseProductFilterPipe) filter?: ProductFilter,
  ) {
    return await this.productService.findAll(filter, paginationDto);
  }

  @Get(':productId')
  async getProductById(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Product> {
    return await this.productService.findById(productId);
  }

  @Post('')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async createProduct(
    @Req() req: AuthRequest,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<Product> {
    return await this.productService.create(req.user.id, dto, images);
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async updateProduct(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProductDto,
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<Product> {
    return await this.productService.updateProduct(
      req.user.id,
      productId,
      dto,
      images,
    );
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  async deleteProduct(
    @Req() req: AuthRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Product> {
    return await this.productService.deleteProduct(req.user.id, productId);
  }
}
