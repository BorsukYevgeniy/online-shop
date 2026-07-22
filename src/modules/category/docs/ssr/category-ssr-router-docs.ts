import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ApiAdminForbiddenResponseDocs,
  ApiUnauthorizedResponseDocs,
  AuthCookiesDocs,
} from '../../../../common/decorators/docs/auth';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SearchCategoryDto } from '../../dto/search-category.dto';
import { SortCategoryDto } from '../../dto/sort-category.dto';
import { CategoryApiRoutes } from '../api';
import { ApiCategoryIdParamDocs } from '../shared';

export class CategorySsrRoutesDocs {
  static GetAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Get category by id' }),
      ApiOkResponse({ description: 'Category fetched' }),
      ApiCategoryIdParamDocs(),
      AuthCookiesDocs(),
      ApiUnauthorizedResponseDocs(),
    );
  }

  static Search() {
    return applyDecorators(
      ApiOperation({ summary: 'Search category' }),
      ApiOkResponse({ description: 'Categories fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SortCategoryDto }),
      ApiQuery({ type: SearchCategoryDto }),
    );
  }

  static GetById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get all categories' }),
      ApiOkResponse({ description: 'Categories fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SortCategoryDto }),
      ApiQuery({ type: SearchCategoryDto }),
      AuthCookiesDocs(),
      ApiUnauthorizedResponseDocs(),
    );
  }

  static RenderCreatePage() {
    return applyDecorators(
      AuthCookiesDocs(),
      ApiUnauthorizedResponseDocs(),
      ApiAdminForbiddenResponseDocs(),
      ApiOperation({ summary: 'Render create category page' }),
    );
  }

  static HandleCreate() {
    return applyDecorators(
      CategoryApiRoutes.Create,
      ApiResponse({
        status: 302,
        description: 'Redirects to /categories',
      }),
    );
  }

  static RenderUpdatePage() {
    return applyDecorators(
      AuthCookiesDocs(),
      ApiUnauthorizedResponseDocs(),
      ApiAdminForbiddenResponseDocs(),
      ApiOperation({ summary: 'Render update category page' }),
    );
  }

  static HandleUpdate() {
    return applyDecorators(
      CategoryApiRoutes.Update,
      ApiResponse({
        status: 302,
        description: 'Redirects to /categories/:categoryId',
      }),
    );
  }

  static HandleDeleteById() {
    return applyDecorators(
      CategoryApiRoutes.DeleteById,
      ApiResponse({
        status: 302,
        description: 'Redirects to /categories',
      }),
    );
  }
}
