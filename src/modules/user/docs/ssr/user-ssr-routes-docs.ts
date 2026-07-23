import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiAdminForbiddenResponseDocs } from '../../../../common/decorators/docs/auth';
import { ApiRedirectResponse } from '../../../../common/decorators/docs/routes';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SearchUserDto } from '../../dto/search-user.dto';
import { SortUserDto } from '../../dto/sort-user.dto';
import { UserApiRoutesDocs } from '../api';

export class UserSsrRoutesDocs {
  static GetMe = UserApiRoutesDocs.GetMe;
  static GetById = UserApiRoutesDocs.GetById;
  static GetUserProducts = UserApiRoutesDocs.GetUserProducts;
  static HandleAssignAdmin = UserApiRoutesDocs.AssignAdmin;

  static GetAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Getting all users' }),
      ApiOkResponse({ description: 'Users fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SortUserDto }),
      ApiAdminForbiddenResponseDocs(),
    );
  }

  static Search() {
    return applyDecorators(
      ApiOperation({ summary: 'Searching users' }),
      ApiOkResponse({ description: 'Users fetched' }),
      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SearchUserDto }),
      ApiQuery({ type: SortUserDto }),
    );
  }

  static HandleDeleteMe() {
    return applyDecorators(
      UserApiRoutesDocs.DeleteMe(),
      ApiRedirectResponse('/'),
    );
  }

  static HandleDeleteById() {
    return applyDecorators(
      UserApiRoutesDocs.DeleteById(),
      ApiRedirectResponse('/'),
    );
  }
}
