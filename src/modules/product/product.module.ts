import { Module } from '@nestjs/common';
import { FileStorageModule } from '../../infra/file-storage/file-storage.module';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { CategoryModule } from '../category/category.module';
import { TokenModule } from '../token/token.module';
import { ProductImagesService } from './images/product-images.service';
import { ProductApiController } from './product.api.controller';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import { ProductSsrController } from './product.ssr.controller';

@Module({
  imports: [PrismaModule, TokenModule, CategoryModule, FileStorageModule],
  controllers: [ProductApiController, ProductSsrController],
  providers: [ProductImagesService, ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
