import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './products/product.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TokensModule } from './token/tokens.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ProductModule,
    AuthModule,
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'static'),
    }),
    TokensModule,
    RolesModule,
  ],
})
export class AppModule {}
