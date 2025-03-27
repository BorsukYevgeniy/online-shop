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

  it('GET /users/search - 200 OK - Should search user by nickname with default sorting', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/users/search')
      .query({ nickname: 'use' })
      .expect(200);

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
  });

  it('GET /users/search - 200 OK - Should search user by nickname and min date with default sorting', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/users/search')
      .query({ nickname: 'use' })
      .query({ minDate: '2024-01-01' })
      .expect(200);

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
  });

  it('GET /users/search - 200 OK - Should search user by nickname and max date with default sorting', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/users/search')
      .query({ nickname: 'use' })
      .query({ maxDate: '2100-01-01' })
      .expect(200);

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
  });

  it('GET /users/search - 200 OK - Should search user by nickname and date range with default sorting', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get('/users/search')
      .query({ nickname: 'use' })
      .query({ minDate: '2022-01-01' })
      .query({ maxDate: '2100-01-01' })
      .expect(200);

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
  });

  it('GET /users/:userId - 200 OK - Should return user id', async () => {
    const { body: users } = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(200);

    expect(users).toEqual({
      createdAt: expect.any(String),
      nickname: 'user',
      id: expect.any(Number),
      role: 'USER',
    });
  });

  it('GET /users/:userId - 404 NOT FOUND - Should return 404 HTTP code', async () => {
    await request(app.getHttpServer())
      .get(`/users/${userId-1}`)
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(404);
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

  it('PATCH /users/assing-admin/:userId - 200 OK - Should assign user to admin', async () => {
    const { body: user } = await request(app.getHttpServer())
      .patch(`/users/assing-admin/${userId}`)
      .set('Cookie', [`accessToken=${adminAccessToken}`])
      .expect(200);

    expect(user).toEqual({
      id: expect.any(Number),
      nickname: 'user',
      role: 'ADMIN',
      createdAt: expect.any(String),
    });
  });

  it('PATCH /users/assing-admin/:userId - 404 NOT FOUND - Should return 404 HTTP code', async () => {
    await request(app.getHttpServer())
      .patch(`/users/assing-admin/${userId-1}`)
      .set('Cookie', [`accessToken=${adminAccessToken}`])
      .expect(404);
  });

  it('DELETE /users/me - 204 NO CONTENT - Should delete user by himself', async () => {
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(204);
  });

  it('DELETE /users/:userId - 204 NO CONTENT - Should delete user by id', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${adminId}`)
      .set('Cookie', [`accessToken=${adminAccessToken}`])
      .expect(204);
  });

  
  it('DELETE /users/:userId - 404 NOT FOUND - Should return 404 HTTP code', async () => {
    await request(app.getHttpServer())
      .delete(`/users/assing-admin/${userId-1}`)
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(404);
  });
});
