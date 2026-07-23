import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Render,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../common/decorators/routes/user.decorator';
import { Role } from '../../common/enum/role.enum';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { TokenPayload } from '../token/interface/token.interfaces';
import { CartService } from './cart.service';
import { CartSsrControllerDocs, CartSsrRoutesDocs } from './docs/ssr';

@CartSsrControllerDocs()
@Controller('cart')
@UseGuards(VerifiedUserGuard)
@UseFilters(SsrExceptionFilter)
export class CartSsrController {
  constructor(private readonly cartService: CartService) {}

  @CartSsrRoutesDocs.GetCartById()
  @Get(':cartId')
  @Render('cart/get-cart-by-id')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  async getCartByIdPage(@Param('cartId') cartId: number) {
    return await this.cartService.getCart(cartId);
  }

  @CartSsrRoutesDocs.GetMyCart()
  @Get()
  @Render('cart/my-cart')
  @UseInterceptors(CacheInterceptor)
  async getMyCart(@User() user: TokenPayload) {
    const { products } = await this.cartService.getMyCart(user.id);

    return { products };
  }

  @CartSsrRoutesDocs.AddToCart()
  @Post('products/:productId')
  async handleAddToCart(
    @Param('productId') productId: number,
    @User() user: TokenPayload,
    @Res() res: Response,
  ) {
    await this.cartService.addToCart(productId, user.id);

    res.redirect(303, `/products/${productId}`);
  }

  @CartSsrRoutesDocs.RemoveFromCart()
  @Delete('products/:productId')
  async handleDeleteCart(
    @Param('productId') productId: number,
    @User() user: TokenPayload,
    @Res() res: Response,
  ) {
    await this.cartService.removeFromCart(productId, user.id);

    res.redirect(303, '/cart');
  }

  @CartSsrRoutesDocs.ClearCart()
  @Delete('products')
  async handleClearCart(@User() user: TokenPayload, @Res() res: Response) {
    await this.cartService.clearCart(user.id);

    res.redirect(303, '/cart');
  }
}
