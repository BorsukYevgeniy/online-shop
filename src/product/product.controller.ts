import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImagesInterceptor } from './interceptor/images.interceptor';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts() {
    return await this.productService.findAll();
  }

  @Get(':productId')
  async getProductById(@Param('productId', ParseIntPipe) productId: number) {
    return await this.productService.findById(productId);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async createProduct(
    @Req() req,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return await this.productService.create(Number(req.user.id), dto, images);
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async updateProduct(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return await this.productService.updateProduct(
      Number(req.user.id),
      productId,
      dto,
      images,
    );
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  async deleteProduct(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return await this.productService.deleteProduct(
      Number(req.user.id),
      productId,
    );
  }
}
