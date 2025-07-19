import { ConfigModule } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TestingModule, Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserModule } from '../src/user/user.module';
import * as request from 'supertest';
import { hash } from 'bcryptjs';
import { ValidationPipe } from '@nestjs/common';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';

describe('UserController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
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
        UserModule,
        AuthModule,
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  let adminAccessToken: string, userAccessToken: string;
  let adminId: number, userId: number;
  beforeAll(async () => {
    const hashedPassword = await hash('password', 10);

    const [user, admin] = await Promise.all([
      prisma.user.create({
        data: {
          email: 'user@gmail.com',
          password: hashedPassword,
          nickname: 'user',
        },
        select: { id: true },
      }),
      prisma.user.create({
        data: {
          email: 'admin@gmail.com',
          password: hashedPassword,
          nickname: 'admin',
          role: 'ADMIN',
          isVerified: true,
        },
        select: { id: true },
      }),
    ]);

    const [{ headers: adminHeaders }, { headers: userHeaders }] =
      await Promise.all([
        //Login as admin
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'admin@gmail.com', password: 'password' }),

        //Login as user
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'user@gmail.com', password: 'password' }),
      ]);

    adminAccessToken = adminHeaders['set-cookie'][0]
      .split('=')[1]
      .split(';')[0];
    userAccessToken = userHeaders['set-cookie'][0].split('=')[1].split(';')[0];

    userId = user.id;
    adminId = admin.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('GET /api/users - 200 OK - Should return users with default sorting', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/api/users')
      .set('Cookie', [`accessToken=${adminAccessToken}`])
      .expect(200);

    expect(users).toEqual({
      total: 2,
      totalPages: 1,
      page: 1,
      pageSize: 10,
      prevPage: null,
      nextPage: null,
      users: [
        {
          createdAt: expect.any(String),
          id: adminId,
          nickname: 'admin',
          role: 'ADMIN',
          isVerified: true,
          verifiedAt: null,
        },
        {
          createdAt: expect.any(String),
          id: userId,
          nickname: 'user',
          role: 'USER',
          isVerified: false,
          verifiedAt: null,
        },
      ],
    });
  });

  it('GET /api/users/me - 200 OK - Should return me', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(200);

    expect(users).toEqual({
      id: expect.any(Number),
      email: 'user@gmail.com',
      createdAt: expect.any(String),
      nickname: 'user',
      role: 'USER',
      isVerified: false,
      verifiedAt: null,
    });
  });

  describe('GET /api/users - Should return all users and search him', () => {
    it.each<
      [
        string,
        200 | 400,
        { nickname?: string; minDate?: string; maxDate?: string } | null,
      ]
    >([
      ['GET /api/users - 200 OK - Should return all users', 200, null],
      [
        'GET /api/users - 200 OK - Should search user by nickname',
        200,
        { nickname: 'use' },
      ],
      [
        'GET /api/users - 200 OK - Should search user by nickname and min date',
        200,
        { nickname: 'use', minDate: '2024-01-01' },
      ],
      [
        'GET /api/users - 200 OK - Should search user by nickname and max date',
        200,
        { nickname: 'use', maxDate: '2100-01-01' },
      ],
      [
        'GET /api/users - 200 OK - Should search user by nickname and date range',
        200,
        {
          nickname: 'use',
          minDate: '2022-01-01',
          maxDate: '2100-01-01',
        },
      ],
      [
        'GET /api/users - 400 BAD REQUEST - Should return 400 HTTP code because nickname not valid',
        400,
        { nickname: 'us' },
      ],
      [
        'GET /api/users - 400 BAD REQUEST - Should return 400 HTTP code because minDate not valid',
        400,
        { nickname: 'us', minDate: '123' },
      ],
      [
        'GET /api/users - 400 BAD REQUEST - Should return 400 HTTP code because maxDate not valid',
        400,
        { nickname: 'us', maxDate: '123' },
      ],
      [
        'GET /api/users - 400 BAD REQUEST - Should return 400 HTTP code because data not valid',
        400,
        { nickname: 'us', maxDate: '123', minDate: '123' },
      ],
    ])('%s', async (_, statusCode, dto) => {
      const { body: users } = await request(app.getHttpServer())
        .get('/api/users')
        .query(dto)
        .set('Cookie', [`accessToken=${userAccessToken}`])
        .expect(statusCode);

      if (statusCode === 200 && !dto) {
        expect(users).toEqual({
          nextPage: null,
          page: 1,
          pageSize: 10,
          prevPage: null,
          total: 2,
          totalPages: 1,
          users: [
            {
              createdAt: expect.any(String),
              id: expect.any(Number),
              nickname: 'admin',
              role: 'ADMIN',
              isVerified: true,
              verifiedAt: null,
            },
            {
              createdAt: expect.any(String),
              id: expect.any(Number),
              nickname: 'user',
              role: 'USER',
              isVerified: false,
              verifiedAt: null,
            },
          ],
        });
      } else if (statusCode === 200 && dto) {
        expect(users).toEqual({
          nextPage: null,
          page: 1,
          pageSize: 10,
          prevPage: null,
          total: 1,
          totalPages: 1,
          users: [
            {
              createdAt: expect.any(String),
              nickname: 'user',
              id: expect.any(Number),
              role: 'USER',
              isVerified: false,
              verifiedAt: null,
            },
          ],
        });
      }
    });
  });

  describe('GET /api/users/:userId - Should return user id', () => {
    it.each<[string, 200 | 404]>([
      [
        'GET /api/users/:userId - 200 OK - Should return user searched by id',
        200,
      ],
      [
        'GET /api/users/:userId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .get(`/api/users/${statusCode === 404 ? userId - 2 : userId}`)
        .set('Cookie', [`accessToken=${userAccessToken}`])
        .expect(statusCode);

      expect(body).toEqual(
        statusCode === 404
          ? { message: 'User not found', error: 'Not Found', statusCode: 404 }
          : {
              createdAt: expect.any(String),
              nickname: 'user',
              id: expect.any(Number),
              role: 'USER',
              isVerified: false,
              verifiedAt: null,
            },
      );
    });
  });

  it('GET /api/users/:userId/products - 200 OK - Should return produts of user', async () => {
    const { body: products } = await request(app.getHttpServer())
      .get(`/api/users/${adminId}/products`)
      .set('Cookie', [`accessToken=${adminAccessToken}`])
      .expect(200);

    expect(products).toEqual({
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 10,
      prevPage: null,
      nextPage: null,
      products: [],
    });
  });

  describe('PATCH /api/users/assing-admin/:userId - Should assign user to admin', () => {
    it.each<[string, 200 | 404]>([
      [
        'PATCH /api/users/assing-admin/:userId - 200 OK - Should assign user to admin',
        200,
      ],
      [
        'PATCH /api/users/assing-admin/:userId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .patch(
          `/api/users/assing-admin/${statusCode === 404 ? userId - 2 : userId}`,
        )
        .set('Cookie', [`accessToken=${adminAccessToken}`])
        .expect(statusCode);

      if (statusCode === 200) {
        expect(body).toEqual({
          id: expect.any(Number),
          nickname: 'user',
          role: 'ADMIN',
          createdAt: expect.any(String),
          isVerified: false,
          verifiedAt: null,
        });
      }
    });
  });

  it('DELETE /api/users/me - 204 NO CONTENT - Should delete user by himself', async () => {
    await request(app.getHttpServer())
      .delete('/api/users/me')
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(204);
  });

  describe('DELETE /api/users/:userId - Should delete user by id', () => {
    it.each<[string, 204 | 404]>([
      [
        'DELETE /api/users/:userId - 204 NO CONTENT - Should delete user by id',
        204,
      ],
      [
        'DELETE /api/users/:userId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      await request(app.getHttpServer())
        .delete(`/api/users/${statusCode === 404 ? adminId - 2 : adminId}`)
        .set('Cookie', [`accessToken=${adminAccessToken}`])
        .expect(statusCode);
    });
  });
});
