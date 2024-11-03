import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductRepository } from './product.repository';
import { FilesModule } from 'src/files/files.module';
import { TokensModule } from 'src/token/tokens.module';

@Module({
  imports: [PrismaModule, FilesModule, TokensModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
