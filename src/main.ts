import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { join } from 'path';
import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger: Logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.use(cookieParser());
  app.use(methodOverride('_method'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Onlie shop API')
    .setDescription('The online shop API description')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT);

  logger.log(`Application is running on: http://localhost:${process.env.PORT}`);
}

bootstrap();
