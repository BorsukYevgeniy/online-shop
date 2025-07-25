import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import { ChatModule } from '../src/chat/chat.module';

import { hash } from 'bcryptjs';
import { CreateChatDto } from '../src/chat/dto/create-chat.dto';
import { JwtModule } from '@nestjs/jwt';

describe('ChatController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
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
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        ChatModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');
    app.useStaticAssets(join(__dirname, '..', 'public'));

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  let chatId: number;
  let userAccessToken: string, guestAccessToken: string;
  beforeAll(async () => {
    const password = await hash('123456', 3);

    const [user, admin, guest] = await Promise.all([
      prisma.user.create({
        data: {
          email: 'test@gmail.com',
          password,
          nickname: 'user',
          isVerified: true,
        },
        select: { id: true, email: true },
      }),
      prisma.user.create({
        data: {
          email: 'admin@gmail.com',
          password,
          nickname: 'admin',
          isVerified: true,
          role: 'ADMIN',
        },
        select: { id: true, email: true },
      }),
      prisma.user.create({
        data: {
          email: 'guest@gmail.com',
          password,
          nickname: 'guest',
          isVerified: true,
          role: 'ADMIN',
        },
        select: { email: true },
      }),
    ]);

    const chat = await prisma.chat.create({
      data: { users: { connect: [{ id: user.id }, { id: admin.id }] } },
    });

    chatId = chat.id;

    const [{ header: userHeaders }, { headers: guestHeaders }] =
      await Promise.all([
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: user.email, password: '123456' }),
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: guest.email, password: '123456' }),
      ]);
    userAccessToken = userHeaders['set-cookie'][0].split('=')[1].split(';')[0];
    guestAccessToken = guestHeaders['set-cookie'][0]
      .split('=')[1]
      .split(';')[0];
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.token.deleteMany({});
    await app.close();
  });

  it('GET /api/chats/:chatId/messages - 200 OK - Should get messages in chat', async () => {
    const { body } = await request(app.getHttpServer())
      .get(`/api/chats/${chatId}/messages`)
      .set('Cookie', [`accessToken=${guestAccessToken}`]) // guestAccessToken because guest is an admin
      .expect(200);

    expect(body).toEqual([]);
  });

  describe('POST /api/chats/:chatId/messages - Should create message in chat', () => {
    it.each<[string, 201 | 400 | 403 | 404]>([
      [
        'POST /api/chats/:chatId/messages - 400 BAD REQUEST - Should return 404 HTTP code because chat not found',
        404,
      ],
      [
        'POST /api/chats/:chatId/messages - 403 FORBIDDEN - Should return 403 HTTP code because user doesnt exist in this chat',
        403,
      ],
      [
        'POST /api/chats/:chatId/messages - 201 CREATED - Should create message in chat',
        201,
      ],
      [
        'POST /api/chats/:chatId/messages - 400 BAD REQUEST - Should return 400 HTTP code because dto not valid',
        400,
      ],
    ])('%s', async (_, code) => {
      switch (code) {
        case 201:
          await request(app.getHttpServer())
            .post(`/api/chats/${chatId}/messages`)
            .send({ text: '123456' })
            .set('Cookie', [`accessToken=${userAccessToken}`])
            .expect(201);
          break;

        case 404:
          await request(app.getHttpServer())
            .post(`/api/chats/${chatId - 2}/messages`)
            .send({ text: '123456' })
            .set('Cookie', [`accessToken=${guestAccessToken}`])
            .expect(404);
          break;

        case 400:
          await request(app.getHttpServer())
            .post(`/api/chats/${chatId}/messages`)
            .send({ text: undefined }) // не валідний dto
            .set('Cookie', [`accessToken=${guestAccessToken}`])
            .expect(400);
          break;

        case 403:
          await request(app.getHttpServer())
            .post(`/api/chats/${chatId}/messages`)
            .send({ text: '123456' })
            .set('Cookie', [`accessToken=${guestAccessToken}`])
            .expect(403);
          break;
      }
    });
  });
});
