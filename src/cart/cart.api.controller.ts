import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  UseInterceptors,
  Param,
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
import { User } from '../decorators/routes/user.decorator';
import { TokenPayload } from '../token/interface/token.interfaces';

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
  async getCart(
    @Param('cartId', ParseIntPipe) cartId: number,
  ): Promise<CartProduct> {
    return await this.cartService.getCart(cartId);
  }

  @ApiOperation({ summary: 'Get my cart' })
  @ApiOkResponse({ description: 'Cart fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyCart(@User() user: TokenPayload): Promise<CartProduct> {
    return await this.cartService.getMyCart(user.id);
  }

  @ApiOperation({ summary: 'Add product to cart' })
  @ApiOkResponse({ description: 'Product added' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiParam({ name: 'productId', type: Number })
  @Post('products/:productId')
  @HttpCode(200)
  async addToCart(
    @User() user: TokenPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.addToCart(productId, user.id);
  }

  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiOkResponse({ description: 'Product added' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiParam({ name: 'productId', type: Number })
  @Delete('products/:productId')
  async removeFromCart(
    @User() user: TokenPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.removeFromCart(productId, user.id);
  }

  @ApiOperation({ summary: 'Clear cart' })
  @ApiOkResponse({ description: 'Cart cleared' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @Delete('products')
  async clearCart(@User() user: TokenPayload): Promise<CartProduct> {
    return await this.cartService.clearCart(user.id);
  }
}
