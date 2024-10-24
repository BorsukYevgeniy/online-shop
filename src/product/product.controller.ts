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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(
    FilesInterceptor('image', 4, {
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only JPG, JPEG, PNG files'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async createProduct(
    @Req() req,
    @Body() dto: CreateProductDto,
    @UploadedFiles() image: Express.Multer.File[],
  ) {
    return await this.productService.create(Number(req.user.id), dto, image);
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
