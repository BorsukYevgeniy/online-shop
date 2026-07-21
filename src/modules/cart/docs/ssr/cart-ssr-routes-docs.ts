import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CartApiRoutesDocs } from '../api';

export class CartSsrRoutesDocs {
  static GetCartById = CartApiRoutesDocs.GetCartById;
  static GetMyCart = CartApiRoutesDocs.GetMyCart;

  static AddToCart() {
    return applyDecorators(
      CartApiRoutesDocs.AddToCart(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /products/:productId',
      }),
    );
  }

  static RemoveFromCart() {
    return applyDecorators(
      CartApiRoutesDocs.RemoveFromCart(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /cart',
      }),
    );
  }

  static ClearCart() {
    return applyDecorators(
      CartApiRoutesDocs.ClearCart(),
      ApiResponse({
        status: 302,
        description: 'Redirects to /cart',
      }),
    );
  }
}
