import { Injectable } from '@nestjs/common';
import { Cart } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMyCart(userId: number): Promise<Cart> {
    return await this.prisma.cart.findUnique({ where: { userId } });
  }

  async findCartById(cartId: number): Promise<Cart> {
    return await this.prisma.cart.findUnique({ where: { id: cartId } });
  }

  async addToCart(productId: number, userId: number): Promise<Cart> {
    return await this.prisma.cart.update({
      where: { userId },
      data: { products: { connect: { id: productId } } },
    });
  }

  async removeFromCart(productId: number, userId: number): Promise<Cart> {
    return await this.prisma.cart.update({
      where: { userId },
      data: { products: { disconnect: { id: productId } } },
    });
  }

  async clearCart(userId: number): Promise<Cart> {
    return await this.prisma.cart.update({
      where: { userId },
      data: { products: { set: [] } },
    });
  }
}
