import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @Req() req,
    @Body() dto: CreateProductDto,
    @UploadedFile() image,
  ) {
    return await this.productService.create(Number(req.user.id), dto,image);
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  async updateProduct(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(
      Number(req.user.id),
      productId,
      dto,
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
