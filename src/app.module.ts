import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ProductModule,
    AuthModule,
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'static'),
    }),
  ],
})
export class AppModule {}
