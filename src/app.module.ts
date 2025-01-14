import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TokenModule } from './token/token.module';
import { RoleModule } from './role/role.module';
import { ScheduleModule } from '@nestjs/schedule';

import { join as joinPath } from 'path';
import { CategoryModule } from './category/category.module';
@Module({
  imports: [
    PrismaModule,
    UserModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ProductModule,
    AuthModule,
    FileModule,
    ServeStaticModule.forRoot({
      rootPath: joinPath(__dirname, '..', 'static'),
    }),
    TokenModule,
    RoleModule,
    ScheduleModule.forRoot(),
    CategoryModule,
  ],
})
export class AppModule {}
