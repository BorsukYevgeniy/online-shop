import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthRequest } from '../types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../enum/role.enum';
import { Cart } from '@prisma/client';

@Controller('cart')
@UseGuards(VerifiedUserGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get(':cartId')
  async getCart(@Param('cartId') cartId: number): Promise<Cart> {
    return await this.cartService.getCart(cartId);
  }

  @Get()
  async getMyCart(@Req() req: AuthRequest): Promise<Cart> {
    return await this.cartService.getMyCart(req.user.id);
  }

  @Post('products/:productId')
  async addToCart(
    @Req() req: AuthRequest,
    @Param('productId') productId: number,
  ): Promise<Cart> {
    return await this.cartService.addToCart(productId, req.user.id);
  }

  @Delete('products/:productId')
  async removeFromCart(
    @Req() req: AuthRequest,
    @Param('productId') productId: number,
  ): Promise<Cart> {
    return await this.cartService.addToCart(productId, req.user.id);
  }

  @Delete('products')
  async clearCart(@Req() req: AuthRequest): Promise<Cart> {
    return await this.cartService.clearCart(req.user.id);
  }
}
