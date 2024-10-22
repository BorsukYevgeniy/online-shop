import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(){
    return await this.productService.findAll();
  }


  @Get(':userId')
  async getUserProduct(@Param('userId', ParseIntPipe) userId: number) {
    return await this.productService.findUserProduct(userId);
  }

  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    return await this.productService.create(1, dto);
  }
}
