import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductApiController } from './product.api.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductRepository } from './product.repository';
import { FileModule } from '../file/file.module';
import { TokenModule } from '../token/token.module';
import { ProductSsrController } from '../product/product.ssr.controller';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [PrismaModule, FileModule, TokenModule, CategoryModule],
  controllers: [ProductApiController, ProductSsrController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
