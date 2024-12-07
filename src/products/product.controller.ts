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
import { AuthGuard } from '../guards/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { AuthRequest } from '../interfaces/express-requests.interface';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  async getAllProducts(
    @Query('title') title?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return await this.productService.findAll({
      title,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
    });
  }

  @Get(':productId')
  async getProductById(@Param('productId', ParseIntPipe) productId: number) {
    return await this.productService.findById(productId);
  }

  @Post('')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async createProduct(
    @Req() req: AuthRequest,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return await this.productService.create(req.user.id, dto, images);
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async updateProduct(
    @Req() req: AuthRequest,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
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
  ) {
    return await this.productService.deleteProduct(req.user.id, productId);
  }
}
