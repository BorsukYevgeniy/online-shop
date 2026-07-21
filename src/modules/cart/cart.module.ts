import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { CartApiController } from './cart.api.controller';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { CartSsrController } from './cart.ssr.controller';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [CartApiController, CartSsrController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
