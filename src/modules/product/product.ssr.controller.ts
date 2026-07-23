import { CacheInterceptor } from '@nestjs/cache-manager';
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
  Res,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { User } from '../../common/decorators/routes/user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { CategoryService } from '../category/category.service';
import { TokenPayload } from '../token/interface/token.interfaces';
import { ProductSsrControllerDocs, ProductSsrRoutesDocs } from './docs/ssr';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { SortProductDto } from './dto/sort-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { ValidateProductDtoPipe } from './pipe/validate-product-filter.pipe';
import { ProductService } from './product.service';

@ProductSsrControllerDocs()
@Controller('products')
@UseFilters(SsrExceptionFilter)
export class ProductSsrController {
  constructor(
    private readonly productService: ProductService,
    private readonly categorySerivce: CategoryService,
  ) {}

  @ProductSsrRoutesDocs.GetAll()
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

  @ProductSsrRoutesDocs.Search()
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

  @ProductSsrRoutesDocs.RenderCreatePage()
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

  @ProductSsrRoutesDocs.HandleCreate()
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  @Post('create')
  async handleCreatingProduct(
    @User() user: TokenPayload,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Res() res: Response,
  ) {
    await this.productService.create(user.id, dto, images);
    res.redirect('/users/me');
  }

  @ProductSsrRoutesDocs.GetById()
  @Get(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Render('products/get-product-by-id')
  async getProductByIdPage(
    @User() user: TokenPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const product = await this.productService.getById(productId);

    return {
      ...product,
      guestId: !user?.id ? -1 : user.id,
    };
  }

  @ProductSsrRoutesDocs.RenderUpdatePage()
  @Get('update/:productId')
  @Render('products/update-product')
  @UseInterceptors(CacheInterceptor)
  async getUpdateProductPage(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
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

  @ProductSsrRoutesDocs.HandleUpdate()
  @UseGuards(VerifiedUserGuard)
  @UseInterceptors(ImagesInterceptor())
  @Patch('update/:productId')
  async handeProductUpdate(
    @User() user: TokenPayload,
    @Res() res: Response,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    await this.productService.update(user.id, productId, dto, images);
    res.redirect(`/products/${productId}`);
  }

  @ProductSsrRoutesDocs.HandleDelete()
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
    @User() user: TokenPayload,
    @Res() res: Response,
  ) {
    await this.productService.delete(user.id, productId);
    res.redirect('/users/me');
  }
}
