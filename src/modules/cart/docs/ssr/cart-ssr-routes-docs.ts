import { applyDecorators } from '@nestjs/common';
import { ApiRedirectResponse } from '../../../../common/decorators/docs/routes';
import { CartApiRoutesDocs } from '../api';

export class CartSsrRoutesDocs {
  static GetCartById = CartApiRoutesDocs.GetCartById;
  static GetMyCart = CartApiRoutesDocs.GetMyCart;

  static AddToCart() {
    return applyDecorators(
      CartApiRoutesDocs.AddToCart(),
      ApiRedirectResponse('/products/:productId'),
    );
  }

  static RemoveFromCart() {
    return applyDecorators(
      CartApiRoutesDocs.RemoveFromCart(),
      ApiRedirectResponse('/cart'),
    );
  }

  static ClearCart() {
    return applyDecorators(
      CartApiRoutesDocs.ClearCart(),
      ApiRedirectResponse('/cart'),
    );
  }
}
