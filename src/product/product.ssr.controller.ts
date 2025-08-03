import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../types/request.type';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { ProductService } from './product.service';
import { CategoryService } from '../category/category.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { SortProductDto } from './dto/sort-product.dto';
import { ValidateProductDtoPipe } from './pipe/validate-product-filter.pipe';
import { PaginationDto } from '../dto/pagination.dto';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('SSR Products')
@Controller('products')
@UseFilters(SsrExceptionFilter)
export class ProductSsrController {
  constructor(
    private readonly productService: ProductService,
    private readonly categorySerivce: CategoryService,
  ) {}

  @ApiOperation({ summary: 'Getting all products' })
  @ApiOkResponse({ description: 'Products fetched' })
  @ApiBadRequestResponse({ description: 'Ivalid query parameters' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SortProductDto })
  @Get()
  @Render('products/get-all-products')
  @UseInterceptors(CacheInterceptor)
  async getAllProducts(
    @Query() sortDto: SortProductDto,
    @Query() paginationDto: PaginationDto,
  ) {
    const { products, ...pagination } = await this.productService.getAll(
      paginationDto,
      sortDto,
      {},
    );

    return {
      products,
      ...pagination,
      ...sortDto,
    };
  }

  @ApiOperation({ summary: 'Searching products' })
  @ApiOkResponse({ description: 'Products fetched' })
  @ApiBadRequestResponse({ description: 'Ivalid query parameters' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SearchProductDto })
  @ApiQuery({ type: SortProductDto })
  @Get('search')
  @UseInterceptors(CacheInterceptor)
  @Render('products/search-product')
  async search(
    @Query(ValidateProductDtoPipe) searchDto: SearchProductDto,
    @Query() sortDto: SortProductDto,
    @Query() paginationDto: PaginationDto,
  ) {
    const { categories } = await this.categorySerivce.getAll(
      { page: 1, pageSize: 10 },
      {},
      {},
    );

    const { products, ...pagination } = await this.productService.getAll(
      paginationDto,
      sortDto,
      searchDto,
    );

    return {
      products: searchDto.title ? products : [],
      ...pagination,
      ...sortDto,
      categories,
    };
  }

  @ApiOperation({ summary: 'Render create product page' })
  @Get('create')
  @Render('products/create-product')
  @UseInterceptors(CacheInterceptor)
  async getCreateProductPage() {
    const { categories } = await this.categorySerivce.getAll(
      { page: 1, pageSize: 10 },
      {},
      {},
    );

    return { categories };
  }

  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product creation payload',
    type: CreateProductDto,
  })
  @ApiOkResponse({ description: 'Product created' })
  @ApiBadRequestResponse({ description: 'Ivalid request body' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiCookieAuth('accessToken')
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  @Post('create')
  async handleCreatingProduct(
    @Req() req: AuthRequest,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Res() res: Response,
  ) {
    await this.productService.create(req.user.id, dto, images);
    res.redirect('/users/me');
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiOkResponse({ description: 'Product found' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiCookieAuth('accessToken')
  @Get(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Render('products/get-product-by-id')
  async getProductByIdPage(
    @Req() req: AuthRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const product = await this.productService.getById(productId);

    return {
      ...product,
      guestId: !req.user?.id ? -1 : req.user.id,
    };
  }

  @ApiOperation({ summary: 'Render update product page' })
  @ApiParam({ name: 'productId', type: Number })
  @Get('update/:productId')
  @Render('products/update-product')
  @UseInterceptors(CacheInterceptor)
  async getUpdateProductPage(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productService.getById(productId);
    const { categories } = await this.categorySerivce.getAll(
      { page: 1, pageSize: 10 },
      {},
      {},
    );

    return {
      categories,
      product,
    };
  }

  @ApiOperation({ summary: 'Update an existing product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product update payload',
    type: UpdateProductDto,
  })
  @ApiOkResponse({ description: 'Product updated' })
  @ApiBadRequestResponse({ description: 'Ivalid request body' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'You must be verified user or you isnt ownership of product',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiCookieAuth('accessToken')
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  @Patch('update/:productId')
  async handeProductUpdate(
    @Req() req: AuthRequest,
    @Res() res: Response,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    await this.productService.update(req.user.id, productId, dto, images);
    res.redirect('/users/me');
  }

  @ApiOperation({ summary: 'Delete a product' })
  @ApiOkResponse({ description: 'Product deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiForbiddenResponse({
    description: 'You must be verified user or you isnt ownership of product',
  })
  @ApiParam({ name: 'productId', type: Number })
  @ApiCookieAuth('accessToken')
  @UseGuards(VerifiedUserGuard)
  @Delete('delete/:productId')
  async handleDeleteProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    await this.productService.delete(req.user.id, productId);
    res.redirect('/users/me');
  }
}
