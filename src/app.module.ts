import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './products/product.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TokensModule } from './token/tokens.module';
import { RolesModule } from './roles/roles.module';
import { ScheduleModule } from '@nestjs/schedule';

import { join as joinPath } from 'path';
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ProductModule,
    AuthModule,
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: joinPath(__dirname,'..', 'static'),
    }),
    TokensModule,
    RolesModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
