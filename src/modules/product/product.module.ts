import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { CategoryModule } from '../category/category.module';
import { FileModule } from '../file/file.module';
import { TokenModule } from '../token/token.module';
import { ProductApiController } from './product.api.controller';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import { ProductSsrController } from './product.ssr.controller';

@Module({
  imports: [PrismaModule, FileModule, TokenModule, CategoryModule],
  controllers: [ProductApiController, ProductSsrController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
