import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartApiController } from './cart.api.controller';
import { CartRepository } from './cart.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { CartSsrController } from './cart.ssr.controller';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [CartApiController, CartSsrController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
