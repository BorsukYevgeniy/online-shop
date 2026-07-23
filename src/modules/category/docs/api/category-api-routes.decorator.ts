import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiAdminAuthDocs } from '../../../../common/decorators/docs/auth';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { CreateCategoryDto } from '../../dto/create-category.dto';
import { SearchCategoryDto } from '../../dto/search-category.dto';
import { SortCategoryDto } from '../../dto/sort-category.dto';
import { UpdateCategoryDto } from '../../dto/update-category.dto';

function ApiCategoryIdParamDocs() {
  return ApiParam({ name: 'categoryId', type: Number });
}

export class CategoryApiRoutesDocs {
  static GetAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Get all categories or search category' }),
      ApiOkResponse({ description: 'Categories fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SortCategoryDto }),
      ApiQuery({ type: SearchCategoryDto }),
    );
  }

  static GetById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get category by id' }),
      ApiOkResponse({ description: 'Category fetched' }),
      ApiCategoryIdParamDocs(),
    );
  }

  static Create() {
    return applyDecorators(
      ApiOperation({ summary: 'Create category' }),
      ApiOkResponse({ description: 'Category created' }),
      ApiAdminAuthDocs(),
      ApiBody({ type: CreateCategoryDto }),
    );
  }

  static Update() {
    return applyDecorators(
      ApiOperation({ summary: 'Update category' }),
      ApiOkResponse({ description: 'Category updated' }),
      ApiAdminAuthDocs(),
      ApiBody({ type: UpdateCategoryDto }),
      ApiCategoryIdParamDocs(),
    );
  }

  static DeleteById() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete category' }),
      ApiNoContentResponse({ description: 'Category deleted' }),
      ApiAdminAuthDocs(),
      ApiCategoryIdParamDocs(),
    );
  }
}
