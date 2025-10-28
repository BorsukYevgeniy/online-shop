import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/category/category.module';
import { ChatModule } from './modules/chat/chat.module';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';
import { ErrorModule } from './modules/error/error.module';
import { FileModule } from './modules/file/file.module';
import { MessageModule } from './modules/message/message.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';
import { TokenModule } from './modules/token/token.module';
import { UserModule } from './modules/user/user.module';

import { join as joinPath } from 'path';

import { IsAuthorizedMiddleware } from './common/middlewares/is-authorized.middleware';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { TokenSsrMiddleware } from './common/middlewares/token.ssr.middleware';

import { AppSsrController } from './app.ssr.controller';


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
