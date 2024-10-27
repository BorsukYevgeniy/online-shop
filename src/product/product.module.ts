import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductRepository } from './product.repository';
import { FilesModule } from 'src/files/files.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [PrismaModule, FilesModule, TokenModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
