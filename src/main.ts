import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as methodOverride from 'method-override';

async function bootstrap() {
  const logger: Logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.use(cookieParser());
  app.use(methodOverride('_method'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(process.env.PORT);

  logger.log(`Application is running on: http://localhost:${process.env.PORT}`);
}

bootstrap();
