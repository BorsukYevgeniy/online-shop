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
import { SearchUserDto } from 'src/user/dto/search-user.dto';

describe('UserController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        AuthModule,
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 6500);

  let adminAccessToken: string, userAccessToken: string;
  let adminId: number, userId: number;
  beforeAll(async () => {
    const hashedPassword = await hash('password', 10);

    const user = await prisma.user.create({
      data: {
        email: 'user@gmail.com',
        password: hashedPassword,
        nickname: 'user',
      },
      select: { id: true },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        nickname: 'admin',
        role: 'ADMIN',
      },
      select: { id: true },
    });

    const [adminRes, userRes] = await Promise.all([
      //Login as admin
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@gmail.com', password: 'password' }),

      //Login as user
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@gmail.com', password: 'password' }),
    ]);

    adminAccessToken = adminRes.headers['set-cookie'][0]
      .split('=')[1]
      .split(';')[0];
    userAccessToken = userRes.headers['set-cookie'][0]
      .split('=')[1]
      .split(';')[0];

    userId = user.id;
    adminId = admin.id;
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('GET /users - 200 OK - Should return users with default sorting', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/users')
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
        },
        {
          createdAt: expect.any(String),
          id: userId,
          nickname: 'user',
          role: 'USER',
        },
      ],
    });
  });

  it('GET /users/me - 200 OK - Should return me', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/users/me')
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(200);

    expect(users).toEqual({
      id: expect.any(Number),
      email: 'user@gmail.com',
      createdAt: expect.any(String),
      nickname: 'user',
      role: 'USER',
    });
  });

  describe('GET /users/search - Should search users', () => {
    it.each<
      [
        string,
        200 | 400,
        { nickname: string; minDate?: string; maxDate?: string } | null,
      ]
    >([
      [
        'GET /users/search - 200 OK - Should search user by nickname',
        200,
        { nickname: 'use' },
      ],
      [
        'GET /users/search - 200 OK - Should search user by nickname and min date',
        200,
        { nickname: 'use', minDate: '2024-01-01' },
      ],
      [
        'GET /users/search - 200 OK - Should search user by nickname and max date',
        200,
        { nickname: 'use', maxDate: '2100-01-01' },
      ],
      [
        'GET /users/search - 200 OK - Should search user by nickname and date range',
        200,
        {
          nickname: 'use',
          minDate: '2022-01-01',
          maxDate: '2100-01-01',
        },
      ],
      [
        'GET /users/search - 400 BAD REQUEST - Should return 400 HTTP code because nickname not valid',
        400,
        { nickname: 'us' },
      ],
      [
        'GET /users/search - 400 BAD REQUEST - Should return 400 HTTP code because minDate not valid',
        400,
        { nickname: 'us', minDate: '123' },
      ],
      [
        'GET /users/search - 400 BAD REQUEST - Should return 400 HTTP code because maxDate not valid',
        400,
        { nickname: 'us', maxDate: '123' },
      ],
      [
        'GET /users/search - 400 BAD REQUEST - Should return 400 HTTP code because data not valid',
        400,
        { nickname: 'us', maxDate: '123', minDate: '123' },
      ],
    ])('%s', async (_, statusCode, dto) => {
      const { body: users } = await request(app.getHttpServer())
        .get('/users/search')
        .query(dto)
        .expect(statusCode);

      if (statusCode === 200) {
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
            },
          ],
        });
      }
    });
  });

  describe('GET /users/:userId - Should return user id', () => {
    it.each<[string, 200 | 404]>([
      ['GET /users/:userId - 200 OK - Should return user searched by id', 200],
      ['GET /users/:userId - 404 NOT FOUND - Should return 404 HTTP code', 404],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .get(`/users/${statusCode === 404 ? userId - 2 : userId}`)
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
            },
      );
    });
  });

  it('GET /users/:userId/products - 200 OK - Should return produts of user', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get(`/users/${userId}/products`)
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(200);

    expect(users).toEqual({
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 10,
      prevPage: null,
      nextPage: null,
      products: [],
    });
  });

  describe('PATCH /users/assing-admin/:userId - Should assign user to admin', () => {
    it.each<[string, 200 | 404]>([
      [
        'PATCH /users/assing-admin/:userId - 200 OK - Should assign user to admin',
        200,
      ],
      [
        'PATCH /users/assing-admin/:userId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { body } = await request(app.getHttpServer())
        .patch(
          `/users/assing-admin/${statusCode === 404 ? userId - 2 : userId}`,
        )
        .set('Cookie', [`accessToken=${adminAccessToken}`])
        .expect(statusCode);

      if (statusCode === 200) {
        expect(body).toEqual({
          id: expect.any(Number),
          nickname: 'user',
          role: 'ADMIN',
          createdAt: expect.any(String),
        });
      }
    });
  });

  it('DELETE /users/me - 204 NO CONTENT - Should delete user by himself', async () => {
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(204);
  });

  describe('DELETE /users/:userId - Should delete user by id', () => {
    it.each<[string, 204 | 404]>([
      [
        'DELETE /users/:userId - 204 NO CONTENT - Should delete user by id',
        204,
      ],
      [
        'DELETE /users/:userId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      await request(app.getHttpServer())
        .delete(`/users/${statusCode === 404 ? adminId - 2 : adminId}`)
        .set('Cookie', [`accessToken=${adminAccessToken}`])
        .expect(statusCode);
    });
  });
});
