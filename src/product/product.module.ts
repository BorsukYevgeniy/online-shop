import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductRepository } from './product.repository';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
