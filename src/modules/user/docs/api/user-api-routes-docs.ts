import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SearchUserDto } from '../../dto/search-user.dto';
import { SortUserDto } from '../../dto/sort-user.dto';

import {
  ApiAdminForbiddenResponseDocs,
  ApiVerifiedForbidden,
} from '../../../../common/decorators/docs/auth';
import { ApiUserIdParamDocs, ApiUserNotFoundResponseDocs } from '../shared';

export class UserApiRoutesDocs {
  static GetAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Getting all users or searching users' }),
      ApiOkResponse({ description: 'Users fetched' }),

      ApiQuery({ type: PaginationDto }),
      ApiQuery({ type: SearchUserDto }),
      ApiQuery({ type: SortUserDto }),
    );
  }

  static GetMe() {
    return applyDecorators(
      ApiOperation({ summary: 'Getting my account' }),
      ApiOkResponse({ description: 'User fetched' }),
    );
  }

  static GetById() {
    return applyDecorators(
      ApiOperation({ summary: 'Getting user by id' }),
      ApiOkResponse({ description: 'Users fetched' }),
      ApiUserNotFoundResponseDocs(),
      ApiUserIdParamDocs(),
    );
  }

  static GetUserProducts() {
    return applyDecorators(
      ApiOperation({ summary: 'Getting product of user by id' }),
      ApiOkResponse({ description: 'Users fetched' }),
      ApiVerifiedForbidden(),
      ApiUserNotFoundResponseDocs(),
      ApiUserIdParamDocs(),
    );
  }

  static AssignAdmin() {
    return applyDecorators(
      ApiOperation({ summary: 'Assinging admin by user id' }),
      ApiOkResponse({ description: 'Admin assigned' }),
      ApiUserNotFoundResponseDocs(),
      ApiUserIdParamDocs(),
      ApiAdminForbiddenResponseDocs(),
    );
  }

  static DeleteMe() {
    return applyDecorators(
      ApiOperation({ summary: 'Deleting user by id as ownership of account' }),
      ApiNoContentResponse({ description: 'User deleted' }),
    );
  }

  static DeleteById() {
    return applyDecorators(
      ApiOperation({ summary: 'Deleting user by id as admin' }),
      ApiNoContentResponse({ description: 'User deleted' }),
      ApiUserNotFoundResponseDocs(),
      ApiUserIdParamDocs(),
      ApiAdminForbiddenResponseDocs(),
    );
  }
}
