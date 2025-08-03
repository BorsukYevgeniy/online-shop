import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  UseInterceptors,
  Param,
  Req,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthRequest } from '../types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../enum/role.enum';
import { CartProduct } from './types/cart.type';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('API Carts')
@ApiCookieAuth('accessToken')
@Controller('api/cart')
@UseGuards(VerifiedUserGuard)
export class CartApiController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get cart by id' })
  @ApiOkResponse({ description: 'Cart fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiParam({ name: 'cartId', type: Number })
  @Get(':cartId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  async getCart(@Param('cartId', ParseIntPipe) cartId: number): Promise<CartProduct> {
    return await this.cartService.getCart(cartId);
  }

  @ApiOperation({ summary: 'Get my cart' })
  @ApiOkResponse({ description: 'Cart fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyCart(@Req() req: AuthRequest): Promise<CartProduct> {
    return await this.cartService.getMyCart(req.user.id);
  }

  @ApiOperation({ summary: 'Add product to cart' })
  @ApiOkResponse({ description: 'Product added' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiParam({ name: 'productId', type: Number })
  @Post('products/:productId')
  @HttpCode(200)
  async addToCart(
    @Req() req: AuthRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.addToCart(productId, req.user.id);
  }

  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiOkResponse({ description: 'Product added' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiParam({ name: 'productId', type: Number })
  @Delete('products/:productId')
  async removeFromCart(
    @Req() req: AuthRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.removeFromCart(productId, req.user.id);
  }

  @ApiOperation({ summary: 'Clear cart' })
  @ApiOkResponse({ description: 'Cart cleared' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @Delete('products')
  async clearCart(@Req() req: AuthRequest): Promise<CartProduct> {
    return await this.cartService.clearCart(req.user.id);
  }
}
