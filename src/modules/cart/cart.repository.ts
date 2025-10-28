import { Injectable } from '@nestjs/common';
import { Cart } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartProduct } from './types/cart.type';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMyCart(userId: number): Promise<CartProduct> {
    return await this.prisma.cart.findUnique({
      where: { userId },
      include: { products: true },
    });
  }

  async findCartById(cartId: number): Promise<CartProduct> {
    return await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { products: true },
    });
  }

  async addToCart(productId: number, userId: number): Promise<CartProduct> {
    return await this.prisma.cart.update({
      where: { userId },
      data: { products: { connect: { id: productId } } },
      include: { products: true },
    });
  }

  async removeFromCart(
    productId: number,
    userId: number,
  ): Promise<CartProduct> {
    return await this.prisma.cart.update({
      where: { userId },
      data: { products: { disconnect: { id: productId } } },
      include: { products: true },
    });
  }

  async clearCart(userId: number): Promise<CartProduct> {
    return await this.prisma.cart.update({
      where: { userId },
      data: { products: { set: [] } },
      include: { products: true },
    });
  }
}
