import { NestExpressApplication } from '@nestjs/platform-express';
import { CartModule } from '../src/cart/cart.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { APP_GUARD } from '@nestjs/core';
import { brotliDecompressSync } from 'zlib';

describe('UserController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CartModule,
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        AuthModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 6500);

  let accessToken: string;
  let userId: number, productId: number;
  beforeAll(async () => {
    await request(app.getHttpServer()).post('/auth/registration').send({
      email: process.env.TEST_EMAIL,
      password: '123456',
      nickname: 'USER123',
    });

    const { id } = await prisma.user.update({
      where: { email: process.env.TEST_EMAIL },
      data: { role: 'ADMIN', isVerified: true, verifiedAt: new Date() },
      select: { id: true },
    });

    const { id: product_id } = await prisma.product.create({
      data: { title: 'test', description: 'test', price: 12, userId: id },
    });

    const { headers } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: '123456' });

    accessToken = headers['set-cookie'][0].split('=')[1].split(';')[0];
    userId = id;
    productId = product_id;
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  let cartId: number;
  it('GET /cart - 200 OK - Should return my cart', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/cart')
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    cartId = body.id;

    expect(body).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      products: [],
    });
  });

  describe('POST /cart/product/:productId - Should add product to cart', () => {
    it.each([
      [
        'POST /cart/product/:productId - 200 OK - Should add product to cart',
        200,
      ],
      [
        'POST /cart/product/:productId - 400 BAD REQUEST - Return 400 HTTP code because product not found',
        400,
      ],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .post(
          `/cart/products/${statusCode === 200 ? productId : productId + 1}`,
        )
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(statusCode);

      if (statusCode === 200) {
        expect(body).toEqual({
          id: expect.any(Number),
          userId: expect.any(Number),
          products: [
            {
              id: expect.any(Number),
              title: 'test',
              description: 'test',
              price: 12,
              userId,
              images: [],
            },
          ],
        });
      }
    });
  });

  describe('GET /cart/:cartId - Should return cart by id', () => {
    it.each<[string, 200 | 404]>([
      ['GET /cart/:cartId - 200 OK - Should return my cart', 200],
      [
        'GET /cart/:cartId - 404 NOT FOUND - Should return 404 HTTP code beacuse cart not founf',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .get(`/cart/${statusCode === 200 ? cartId : cartId + 1}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(statusCode);

      if (statusCode === 200) {
        expect(body).toEqual({
          id: expect.any(Number),
          userId: expect.any(Number),
          products: [
            {
              id: expect.any(Number),
              title: 'test',
              description: 'test',
              price: 12,
              userId,
              images: [],
            },
          ],
        });
      }
    });
  });

  it('DELETE /cart/product/:productId - 200 OK - Should remove product from cart', async () => {
    const { body } = await request(app.getHttpServer())
      .delete(`/cart/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      products: [],
    });
  });

  it('DELETE /cart/product - 200 OK - Should clear a cart', async () => {
    const { body } = await request(app.getHttpServer())
      .delete('/cart/products/')
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      products: [],
    });
  });
});
