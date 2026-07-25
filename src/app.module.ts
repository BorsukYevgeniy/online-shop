import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/category/category.module';
import { ChatModule } from './modules/chat/chat.module';
import { ErrorModule } from './modules/error/error.module';
import { MessageModule } from './modules/message/message.module';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';

import { join as joinPath } from 'path';

import { IsAuthorizedMiddleware } from './common/middlewares/is-authorized.middleware';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { TokenSsrMiddleware } from './common/middlewares/token.ssr.middleware';

import { ConfigModule, ConfigType } from '@nestjs/config';
import { AppSsrController } from './app.ssr.controller';

import appConfig from './config/app.config';
import redisConfig from './config/redis.config';
import { TokenModule } from './modules/token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),

    ConfigModule.forFeature(appConfig),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule.forFeature(redisConfig)],
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => {
        const logger: Logger = new Logger('Redis');

        logger.debug('Connecting to Redis cache...');

        return config;
      },
    }),

    UserModule,
    MessageModule,
    ChatModule,
    ProductModule,
    AuthModule,
    ErrorModule,
    ServeStaticModule.forRoot({
      rootPath: joinPath(__dirname, '..', 'images'),
    }),
    ScheduleModule.forRoot(),
    CategoryModule,
    CartModule,
    TokenModule,
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
