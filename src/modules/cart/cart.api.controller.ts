import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '../../common/decorators/routes/user.decorator';
import { Role } from '../../common/enum/role.enum';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { TokenPayload } from '../token/interface/token.interfaces';
import { CartService } from './cart.service';
import { CartApiControllerDocs, CartApiRoutesDocs } from './docs/api';
import { CartProduct } from './types/cart.type';

@CartApiControllerDocs()
@Controller('api/cart')
@UseGuards(VerifiedUserGuard)
export class CartApiController {
  constructor(private readonly cartService: CartService) {}

  @CartApiRoutesDocs.GetCartById()
  @Get(':cartId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  async getCart(
    @Param('cartId', ParseIntPipe) cartId: number,
  ): Promise<CartProduct> {
    return await this.cartService.getCart(cartId);
  }

  @CartApiRoutesDocs.GetMyCart()
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyCart(@User() user: TokenPayload): Promise<CartProduct> {
    return await this.cartService.getMyCart(user.id);
  }

  @CartApiRoutesDocs.AddToCart()
  @Post('products/:productId')
  @HttpCode(200)
  async addToCart(
    @User() user: TokenPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.addToCart(productId, user.id);
  }

  @CartApiRoutesDocs.RemoveFromCart()
  @Delete('products/:productId')
  async removeFromCart(
    @User() user: TokenPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.removeFromCart(productId, user.id);
  }

  @CartApiRoutesDocs.ClearCart()
  @Delete('products')
  async clearCart(@User() user: TokenPayload): Promise<CartProduct> {
    return await this.cartService.clearCart(user.id);
  }
}
