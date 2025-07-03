import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Render,
  Req,
  Res,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { AuthRequest } from '../types/request.type';
import { Response } from 'express';
import { CategoryService } from '../category/category.service';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { SortProductDto } from './dto/sort-product.dto';
import { ValidateProductDtoPipe } from './pipe/validate-product-filter.pipe';
import { PaginationDto } from '../dto/pagination.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('products')
@UseFilters(SsrExceptionFilter)
export class ProductSsrController {
  constructor(
    private readonly productService: ProductService,
    private readonly categorySerivce: CategoryService,
  ) {}

  @Get()
  @Render('products/get-all-products')
  @UseInterceptors(CacheInterceptor)
  async getAllProducts(
    @Query() sortDto: SortProductDto,
    @Query() paginationDto: PaginationDto,
  ) {
    const categories = await this.categorySerivce.getAllCategories();

    const { products, ...pagination } = await this.productService.getAll(
      paginationDto,
      sortDto,
      {},
    );

    return {
      products,
      ...pagination,
      ...sortDto,
      currentPage: paginationDto.page,
      currentSize: paginationDto.pageSize,
      categories,
    };
  }

  @Get('search')
  @UseInterceptors(CacheInterceptor)
  @Render('products/search-product')
  async search(
    @Query(ValidateProductDtoPipe) searchDto: SearchProductDto,
    @Query() sortDto: SortProductDto,
    @Query() paginationDto: PaginationDto,
  ) {
    console.log(searchDto);

    const categories = await this.categorySerivce.getAllCategories();

    const { products, ...pagination } = await this.productService.getAll(
      paginationDto,
      sortDto,
      searchDto,
    );

    return {
      products: searchDto.title ? products : [],
      ...pagination,
      ...sortDto,
      currentPage: paginationDto.page,
      currentPageSize: paginationDto.pageSize,
      categories,
    };
  }

  @Get('create')
  @Render('products/create-product')
  @UseInterceptors(CacheInterceptor)
  async getCreateProductPage() {
    const categories = await this.categorySerivce.getAllCategories();
    return { categories };
  }

  @Post('create')
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  async handleCreatingProduct(
    @Req() req: AuthRequest,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Res() res: Response,
  ) {
    await this.productService.create(req.user.id, dto, images);

    res.redirect('/users/me');
  }

  @Get(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Render('products/get-product-by-id')
  async getProductByIdPage(
    @Req() req: AuthRequest,
    @Param('productId') productId: number,
  ) {
    const product = await this.productService.getById(productId);

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      categories: product.categories,
      images: product.images,
      authorId: product.userId,
      userId: !req.user?.id ? -1 : req.user.id,
    };
  }

  @Get('update/:productId')
  @Render('products/update-product')
  @UseInterceptors(CacheInterceptor)
  async getUpdateProductPage(@Param('productId') productId: number) {
    const product = await this.productService.getById(productId);
    const categories = await this.categorySerivce.getAllCategories();

    return {
      categories,
      product,
    };
  }

  @Patch('update/:productId')
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  async handeProductUpdate(
    @Req() req: AuthRequest,
    @Res() res: Response,
    @Param('productId') productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    await this.productService.update(req.user.id, productId, dto, images);

    res.redirect('/users/me');
  }

  @Delete('delete/:productId')
  @UseGuards(VerifiedUserGuard)
  async handleDeleteProduct(
    @Param('productId') productId: number,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    await this.productService.delete(req.user.id, productId);

    res.redirect('/users/me');
  }
}
