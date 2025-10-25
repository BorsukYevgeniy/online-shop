import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TokenModule } from './token/token.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CartModule } from './cart/cart.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

import { join as joinPath } from 'path';
import { CategoryModule } from './category/category.module';

import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { TokenSsrMiddleware } from './common/middlewares/token.ssr.middleware';

import { AppSsrController } from './app.ssr.controller';
import { IsAuthorizedMiddleware } from './common/middlewares/is-authorized.middleware';

import { CacheModule } from '@nestjs/cache-manager';

import { ErrorModule } from './error/error.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    PrismaModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const logger: Logger = new Logger('Redis');

        logger.debug('Connecting to Redis cache...');

        return configService.REDIS_CONFIG;
      },
    }),

    UserModule,
    MessageModule,
    ChatModule,
    ProductModule,
    AuthModule,
    FileModule,
    ErrorModule,
    ServeStaticModule.forRoot({
      rootPath: joinPath(__dirname, '..', 'images'),
    }),
    TokenModule,
    ScheduleModule.forRoot(),
    CategoryModule,
    CartModule,
    ConfigModule,
  ],
  controllers: [AppSsrController],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer): Promise<void> {
    consumer.apply(LoggerMiddleware).forRoutes('');
    consumer
      .apply(TokenSsrMiddleware)
      .exclude(
        '/',
        '/api/*path',
        '/:image',
        '/auth/register',
        '/auth/login',
        '/products/search',
        '/products',
        '/categories/search',
        '/errors/:errorCode',
      )
      .forRoutes('');
    consumer.apply(IsAuthorizedMiddleware).exclude('/api/*path').forRoutes('');
  }
}
