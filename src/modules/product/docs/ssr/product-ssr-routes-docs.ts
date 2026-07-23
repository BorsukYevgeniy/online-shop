import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiRedirectResponse } from '../../../../common/decorators/docs/routes';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SearchProductDto } from '../../dto/search-product.dto';
import { SortProductDto } from '../../dto/sort-product.dto';
import { ProductApiRoutesDocs } from '../api';

export class ProductSsrRoutesDocs {
  static GetById = ProductApiRoutesDocs.GetById;

  static GetAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Getting all products' }),
      ApiOkResponse({ description: 'Products fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SortProductDto }),
    );
  }

  static Search() {
    return applyDecorators(
      ApiOperation({ summary: 'Searching products' }),
      ApiOkResponse({ description: 'Products fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SearchProductDto }),
      ApiQuery({ type: SortProductDto }),
    );
  }

  static RenderCreatePage() {
    return applyDecorators(
      ApiOperation({ summary: 'Render create product page' }),
    );
  }

  static HandleCreate() {
    return applyDecorators(
      ProductApiRoutesDocs.Create(),
      ApiRedirectResponse('/users/me'),
    );
  }

  static HandleUpdate() {
    return applyDecorators(
      ProductApiRoutesDocs.Update(),
      ApiRedirectResponse('/product/:productId'),
    );
  }

  static RenderUpdatePage() {
    return applyDecorators(
      ApiOperation({ summary: 'Render update product page' }),
    );
  }

  static HandleDelete() {
    return applyDecorators(
      ProductApiRoutesDocs.Delete(),
      ApiRedirectResponse('/product/:productId'),
    );
  }
}
