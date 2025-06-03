import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { ValidationPipe } from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /auth/register - Should register a new user', () => {
    it.each<[string, 201 | 400, CreateUserDto]>([
      [
        'POST /auth/register - 201 CREATED - Should register a new user',
        201,
        {
          email: process.env.TEST_EMAIL,
          nickname: 'user',
          password: 'password',
        },
      ],
      [
        'POST /auth/register - 400 BAD REQUEST - Should return 400 http code because user already exists',
        400,
        {
          email: process.env.TEST_EMAIL,
          nickname: 'user',
          password: 'password',
        },
      ],
      [
        'POST /auth/register - 400 BAD REQUEST - Should return 400 http code because email not valid',
        400,
        { email: 'user', nickname: 'user', password: 'password' },
      ],
      [
        'POST /auth/register - 400 BAD REQUEST - Should return 400 http code because nickname not valid',
        400,
        { email: 'user1@gmail.com', nickname: 'us', password: 'password' },
      ],
      [
        'POST /auth/register - 400 BAD REQUEST - Should return 400 http code because password not valid',
        400,
        { email: 'user1@gmail.com', nickname: 'user1', password: 'user' },
      ],
      [
        'POST /auth/register - 400 BAD REQUEST - Should return 400 http code because data not valid',
        400,
        { email: 'user', nickname: 'us', password: 'user' },
      ],
    ])('%s', async (_, statusCode, CreateUserDto) => {
      const { headers } = await request(app.getHttpServer())
        .post('/auth/registration')
        .send(CreateUserDto)
        .expect(statusCode);

      if (statusCode === 201) {
        expect(headers['set-cookie']).toEqual([
          expect.any(String),
          expect.any(String),
        ]);
      }
    });
  });

  let accessToken: string, refreshToken: string;
  describe('POST /auth/login - Should login a user', () => {
    it.each<[string, 200 | 400 | 404, LoginUserDto]>([
      [
        'POST /auth/login - 200 OK - Should login a user',
        200,
        { email: process.env.TEST_EMAIL, password: 'password' },
      ],
      [
        'POST /auth/login - 404 NOT FOUND - Should return 404 HTTP code because user not found',
        404,
        { email: 'user1@gmail.com', password: 'password' },
      ],

      [
        'POST /auth/login - 400 BAD REQUEST - Should return 400 HTTP code because email not valid',
        400,
        { email: 'use', password: 'password' },
      ],
      [
        'POST /auth/login - 400 BAD REQUEST - Should return 400 HTTP code because password not valid',
        400,
        { email: 'user1@gmail.com', password: 'pass' },
      ],
      [
        'POST /auth/login - 400 BAD REQUEST - Should return 400 HTTP code because data not valid',
        400,
        { email: 'user', password: 'pass' },
      ],
    ])('%s', async (_, statusCode, loginUserDto) => {
      const { headers } = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUserDto)
        .expect(statusCode);

      if (statusCode === 200) {
        accessToken = headers['set-cookie'][0].split('=')[1].split(';')[0];
        refreshToken = headers['set-cookie'][1].split('=')[1].split(';')[0];
      }
    });
  });

  it('POST /auth/refresh - 200 OK - Should refresh pair of JWT token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(200);
  });

  it('POST /auth/logout - 200 OK - Should logout a user', async () => {
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

  describe('POST /auth/verify - Should verify user', () => {
    it.each<[string, 200 | 400 | 404]>([
      ['POST /auth/verify - 200 OK - Should verify user', 200],
      [
        'POST /auth/verify - 400 BAD REQUEST - Should return 400 HTTP code because user alredy verified',
        400,
      ],
      [
        'POST /auth/verify - 404 NOT FOUND - Should return 400 HTTP code because user not found',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { verificationLink } = await prisma.user.findUnique({
        where: { email: process.env.TEST_EMAIL },
      });

      if (statusCode === 200) {
        await request(app.getHttpServer())
          .post(`/auth/verify/${verificationLink}`)
          .expect(200);
      } else if (statusCode === 404) {
        await request(app.getHttpServer())
          .post(`/auth/verify/${verificationLink + 1}`)
          .expect(404);
      } else {
        await request(app.getHttpServer())
          .post(`/auth/verify/${verificationLink}`)
          .expect(400);
      }
    });
  });
});
