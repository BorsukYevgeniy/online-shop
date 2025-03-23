import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import * as cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ConfigModule.forRoot({ envFilePath: '.env.test' })],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    await app.init();
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /auth/register - 201 CREATED - Should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/registration')
      .send({ email: 'user@gmail.com', nickname: 'user', password: 'password' })
      .expect(201);

    expect(res.body).toEqual({
      id: expect.any(Number),
      email: 'user@gmail.com',
      nickname: 'user',
      role: 'USER',
      createdAt: expect.any(String),
    });
  });

  let accessToken: string, refreshToken: string;
  it('POST /auth/login - 200 OK - Should login a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@gmail.com', password: 'password' })
      .expect(200);

    accessToken = res.headers['set-cookie'][0].split('=')[1].split(';')[0];
    refreshToken = res.headers['set-cookie'][1].split('=')[1].split(';')[0];
  });

  it('POST /auth/refresh - 200 OK - Should refresh pair of JWT token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(200);
  });

  it('POST /auth/logout - 200 OK- Should logout a user', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(200);
  });

  it('POST /auth/logout-all - 200 OK - Should logout a user from all devices', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout-all')
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);
  });
});
