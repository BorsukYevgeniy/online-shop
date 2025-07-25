import { NestExpressApplication } from '@nestjs/platform-express';
import { CartModule } from '../src/cart/cart.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { hash } from 'bcryptjs';

describe('UserController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        CacheModule.register({
          isGlobal: true,
          ttl: 60 * 1000,
          stores: [
            new Keyv(new KeyvRedis(process.env.REDIS_URL), {
              namespace: '',
              useKeyPrefix: false,
            }),
          ],
        }),
        CartModule,
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
    const password = await hash('123456', 3);

    const { id } = await prisma.user.create({
      data: {
        email: 'test@gmail.com',
        nickname: 'USER123',
        password,
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
        cart: { create: {} },
      },
      select: { id: true },
    });

    const [{ id: product_id }, { headers }] = await Promise.all([
      prisma.product.create({
        data: { title: 'test', description: 'test', price: 12, userId: id },
      }),
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@gmail.com', password: '123456' }),
    ]);

    accessToken = headers['set-cookie'][0].split('=')[1].split(';')[0];
    userId = id;
    productId = product_id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.token.deleteMany({});
    await app.close();
  });

  let cartId: number;
  it('GET /api/cart - 200 OK - Should return my cart', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api/cart')
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    cartId = body.id;

    expect(body).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      products: [],
    });
  });

  describe('POST /api/cart/product/:productId - Should add product to cart', () => {
    it.each([
      [
        'POST /api/cart/product/:productId - 200 OK - Should add product to cart',
        200,
      ],
      [
        'POST /api/cart/product/:productId - 400 BAD REQUEST - Return 400 HTTP code because product not found',
        400,
      ],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .post(
          `/api/cart/products/${statusCode === 200 ? productId : productId + 1}`,
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

  describe('GET /api/cart/:cartId - Should return cart by id', () => {
    it.each<[string, 200 | 404]>([
      ['GET /api/cart/:cartId - 200 OK - Should return my cart', 200],
      [
        'GET /api/cart/:cartId - 404 NOT FOUND - Should return 404 HTTP code beacuse cart not founf',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .get(`/api/cart/${statusCode === 200 ? cartId : cartId + 1}`)
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

  it('DELETE /api/cart/products/:productId - 200 OK - Should remove product from cart', async () => {
    const { body } = await request(app.getHttpServer())
      .delete(`/api/cart/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      products: [],
    });
  });

  it('DELETE /api/cart/products - 200 OK - Should clear a cart', async () => {
    const { body } = await request(app.getHttpServer())
      .delete('/api/cart/products')
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      products: [],
    });
  });
});
