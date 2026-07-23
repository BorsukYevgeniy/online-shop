import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ApiAdminAuthDocs,
  ApiAuthDocs,
} from '../../../../common/decorators/docs/auth';
import { ApiRedirectResponse } from '../../../../common/decorators/docs/routes';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SearchCategoryDto } from '../../dto/search-category.dto';
import { SortCategoryDto } from '../../dto/sort-category.dto';
import { CategoryApiRoutesDocs } from '../api';

export class CategorySsrRoutesDocs {
  static GetAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Get all categories' }),
      ApiOkResponse({ description: 'Categories fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SortCategoryDto }),
      ApiQuery({ type: SearchCategoryDto }),
      ApiAuthDocs(),
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
    return applyDecorators(CategoryApiRoutesDocs.GetById(), ApiAuthDocs());
  }

  static RenderCreatePage() {
    return applyDecorators(
      ApiAdminAuthDocs(),
      ApiOperation({ summary: 'Render create category page' }),
    );
  }

  static HandleCreate() {
    return applyDecorators(
      CategoryApiRoutesDocs.Create(),
      ApiRedirectResponse('/categories'),
    );
  }

  static RenderUpdatePage() {
    return applyDecorators(
      ApiAdminAuthDocs(),
      ApiOperation({ summary: 'Render update category page' }),
    );
  }

  static HandleUpdate() {
    return applyDecorators(
      CategoryApiRoutesDocs.Update(),
      ApiRedirectResponse('/categories/:categoryId'),
    );
  }

  static HandleDeleteById() {
    return applyDecorators(
      CategoryApiRoutesDocs.DeleteById(),
      ApiRedirectResponse('/categories'),
    );
  }
}
