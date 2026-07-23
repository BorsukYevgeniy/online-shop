import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiAdminForbiddenResponseDocs } from '../../../../common/decorators/docs/auth';
import { ApiProductIdParamDocs } from '../../../product/docs/shared';

export class CartApiRoutesDocs {
  static GetCartById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get cart by id' }),
      ApiOkResponse({ description: 'Cart fetched' }),
      ApiParam({ name: 'cartId', type: Number }),
      ApiAdminForbiddenResponseDocs(),
    );
  }

  static GetMyCart() {
    return applyDecorators(
      ApiOperation({ summary: 'Get my cart' }),
      ApiOkResponse({ description: 'Cart fetched' }),
    );
  }

  static AddToCart() {
    return applyDecorators(
      ApiOperation({ summary: 'Add product to cart' }),
      ApiOkResponse({ description: 'Product added' }),
      ApiProductIdParamDocs(),
    );
  }

  static RemoveFromCart() {
    return applyDecorators(
      ApiOperation({ summary: 'Remove product from cart' }),
      ApiOkResponse({ description: 'Product added' }),
      ApiProductIdParamDocs(),
    );
  }

  static ClearCart() {
    return applyDecorators(
      ApiOperation({ summary: 'Clear cart' }),
      ApiOkResponse({ description: 'Cart cleared' }),
    );
  }
}
