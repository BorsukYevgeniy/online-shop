import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiVerifiedForbiddenResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { CreateProductDto } from '../../dto/create-product.dto';
import { SearchProductDto } from '../../dto/search-product.dto';
import { SortProductDto } from '../../dto/sort-product.dto';
import { UpdateProductDto } from '../../dto/update-product.dto';
import { ApiProductIdParamDocs } from '../shared';

function ApiProductNotFoundResponse() {
  return ApiNotFoundResponse({ description: 'Product not found' });
}

export class ProductApiRoutesDocs {
  static GetAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Getting all products or searching products' }),
      ApiOkResponse({ description: 'Products fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SearchProductDto }),
      ApiQuery({ type: SortProductDto }),
    );
  }

  static GetById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get product by ID' }),
      ApiOkResponse({ description: 'Product found' }),
      ApiProductNotFoundResponse(),
      ApiProductIdParamDocs(),
    );
  }

  static Create() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a new product' }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        description: 'Product creation payload',
        type: CreateProductDto,
      }),
      ApiOkResponse({ description: 'Product created' }),
      ApiUnauthorizedResponse(),
      AuthCookiesDocs(),
      ApiVerifiedForbiddenResponseDocs(),
    );
  }

  static Update() {
    return applyDecorators(
      ApiOperation({ summary: 'Update an existing product' }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        description: 'Product update payload',
        type: UpdateProductDto,
      }),
      ApiOkResponse({ description: 'Product updated' }),
      ApiUnauthorizedResponse(),
      ApiForbiddenResponse({
        description: 'You isnt ownership of product',
      }),
      ApiVerifiedForbiddenResponseDocs(),
      ApiProductNotFoundResponse(),
      ApiProductIdParamDocs(),
      AuthCookiesDocs(),
    );
  }

  static Delete() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete a product' }),
      ApiOkResponse({ description: 'Product deleted' }),
      ApiUnauthorizedResponse(),
      ApiProductNotFoundResponse(),
      ApiForbiddenResponse({
        description: 'You isnt ownership of product',
      }),
      ApiVerifiedForbiddenResponseDocs(),
      ApiProductIdParamDocs(),
      AuthCookiesDocs(),
    );
  }
}
