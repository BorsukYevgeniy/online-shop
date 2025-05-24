import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { Cart } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(cartId: number): Promise<Cart> {
    return await this.cartRepository.findCartById(cartId);
  }

  async getMyCart(userId: number): Promise<Cart> {
    return await this.cartRepository.findMyCart(userId);
  }

  async addToCart(productId: number, userId: number): Promise<Cart> {
    return await this.cartRepository.addToCart(productId, userId);
  }

  async removeFromCart(productId: number, userId: number): Promise<Cart> {
    return await this.cartRepository.removeFromCart(productId, userId);
  }

  async clearCart(userId: number): Promise<Cart> {
    return await this.cartRepository.clearCart(userId);
  }
}
