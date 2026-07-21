import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { CategoryApiController } from './category.api.controller';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import { CategorySsrController } from './category.ssr.controller';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [CategoryApiController, CategorySsrController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
