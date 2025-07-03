import {
  Controller,
  Get,
  Post,
  UseGuards,
  Render,
  Req,
  Param,
  Res,
  Delete,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { CartService } from './cart.service';
import { AuthRequest } from '../types/request.type';
import { Response } from 'express';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Role } from '../enum/role.enum';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('cart')
@UseGuards(VerifiedUserGuard)
@UseFilters(SsrExceptionFilter)
export class CartSsrController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  @Render('cart/get-cart-by-id')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  async getCartByIdPage(@Param('cartId') cartId: number) {
    const cart = await this.cartService.getCart(cartId);

    return cart;
  }

  @Get()
  @Render('cart/my-cart')
  @UseInterceptors(CacheInterceptor)
  async getMyCart(@Req() req: AuthRequest) {
    const cart = await this.cartService.getMyCart(req.user.id);

    return { products: cart.products };
  }

  @Post('products/:productId')
  async handleAddToCart(
    @Param('productId') productId: number,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    await this.cartService.addToCart(productId, req.user.id);

    res.redirect(`/products/${productId}`);
  }

  @Delete('products/:productId')
  async handleDeleteCart(
    @Param('productId') productId: number,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    await this.cartService.removeFromCart(productId, req.user.id);

    res.redirect(`/cart`);
  }

  @Delete('products')
  async handleClearCart(@Req() req: AuthRequest, @Res() res: Response) {
    await this.cartService.clearCart(req.user.id);

    res.redirect('/cart');
  }
}
