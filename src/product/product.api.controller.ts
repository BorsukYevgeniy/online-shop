import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiBody,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedProduct, ProductCategory } from './types/product.types';
import { AuthRequest } from '../types/request.type';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { SortProductDto } from './dto/sort-product.dto';

@ApiTags('API Products')
@Controller('api/products')
export class ProductApiController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Getting all products or searching products' })
  @ApiOkResponse({ description: 'Products fetched' })
  @ApiBadRequestResponse({ description: 'Ivalid query parameters' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ type: SearchProductDto })
  @ApiQuery({ type: SortProductDto })
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getAll(
    @Query() searchDto: SearchProductDto,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    return await this.productService.getAll(paginationDto, sortDto, searchDto);
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiOkResponse({ description: 'Product found' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({ name: 'productId', type: Number })
  @Get(':productId')
  @UseInterceptors(CacheInterceptor)
  async getById(
    @Param('productId',ParseIntPipe) productId: number,
  ): Promise<ProductCategory> {
    return await this.productService.getById(productId);
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
  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    return await this.productService.create(req.user.id, dto, images);
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
  @Patch(':productId')
  async update(
    @Req() req: AuthRequest,
    @Param('productId',ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductCategory> {
    return await this.productService.update(
      req.user.id,
      productId,
      dto,
      images,
    );
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
  @HttpCode(204)
  @Delete(':productId')
  async delete(
    @Req() req: AuthRequest,
    @Param('productId',ParseIntPipe) productId: number,
  ): Promise<void> {
    return await this.productService.delete(req.user.id, productId);
  }
}
