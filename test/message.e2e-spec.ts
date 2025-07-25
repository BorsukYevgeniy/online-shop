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

import { hash } from 'bcryptjs';
import { MessageModule } from '../src/message/message.module';

describe('MessageController (e2e)', () => {
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
        MessageModule,
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
    await prisma.user.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.token.deleteMany({});
    await app.close();
  });

  let messageId: number, userId: number, chatId: number;
  let userAccessToken: string, guestAccessToken: string;
  beforeAll(async () => {
    const password = await hash('123456', 3);

    const [user, user2, guest] = await Promise.all([
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
          email: 'test2@gmail.com',
          password,
          nickname: 'user2',
          isVerified: true,
        },
        select: { id: true },
      }),
      prisma.user.create({
        data: {
          email: 'guest@gmail.com',
          password,
          nickname: 'guest',
          isVerified: true,
        },
        select: { email: true },
      }),
    ]);

    const chat = await prisma.chat.create({
      data: { users: { connect: [{ id: user.id }, { id: user2.id }] } },
    });

    const message = await prisma.message.create({
      data: { text: '123456', userId: user.id, chatId: chat.id },
    });

    const [{ headers: userHeaders }, { headers: guestHeaders }] =
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
    messageId = message.id;
    userId = user.id;
    chatId = chat.id;
  });

  describe('GET /api/messages/:messageId - Should get message by id', () => {
    it.each<[string, 200 | 403 | 404]>([
      [
        'GET /api/messages/:messageId - 403 FORBIDDEN - Should return 403 HTTP code because user isnt owner of this messagr',
        403,
      ],
      ['GET /api/messages/:messageId - 200 OK - Should get message by id', 200],
      [
        'GET /api/messages/:messageId - 404 NOT FOUND - Should return 404 HTTP code because message not found',
        404,
      ],
    ])('%s', async (_, code) => {
      if (code === 200) {
        const { body } = await request(app.getHttpServer())
          .get(`/api/messages/${messageId}`)
          .expect(200)
          .set('Cookie', [`accessToken=${userAccessToken}`]);

        expect(body).toEqual({ id: messageId, text: '123456', userId, chatId });
      } else {
        await request(app.getHttpServer())
          .get(`/api/messages/${code === 404 ? messageId + 1 : messageId}`)
          .set('Cookie', [`accessToken=${guestAccessToken}`])
          .expect(code);
      }
    });
  });

  describe('PATCH /api/messages/:messageId - Should update message by id', () => {
    it.each<[string, 200 | 403 | 404]>([
      [
        'PATCH /api/messages/:messageId - 403 FORBIDDEN - Should return 403 HTTP code because user isnt owner of this messagr',
        403,
      ],
      [
        'PATCH /api/messages/:messageId - 200 OK - Should update message by id',
        200,
      ],
      [
        'PATCH /api/messages/:messageId - 404 NOT FOUND - Should return 404 HTTP code because message not found',
        404,
      ],
    ])('%s', async (_, code) => {
      if (code === 200) {
        const { body } = await request(app.getHttpServer())
          .patch(`/api/messages/${messageId}`)
          .send({ text: '1234' })
          .expect(200)
          .set('Cookie', [`accessToken=${userAccessToken}`]);

        expect(body).toEqual({
          id: messageId,
          text: '1234',
          userId,
          chatId,
          user: { nickname: 'user' },
        });
      } else {
        await request(app.getHttpServer())
          .patch(`/api/messages/${code === 404 ? messageId + 1 : messageId}`)
          .send({ text: '1234' })
          .set('Cookie', [`accessToken=${guestAccessToken}`])
          .expect(code);
      }
    });
  });

  describe('PATCH /api/messages/:messageId - Should update message by id', () => {
    it.each<[string, 204 | 403 | 404]>([
      [
        'DELETE /api/messages/:messageId - 403 FORBIDDEN - Should return 403 HTTP code because user isnt owner of this messagr',
        403,
      ],
      [
        'DELETE /api/messages/:messageId - 200 OK - Should delete message by id',
        204,
      ],
      [
        'DELETE /api/messages/:messageId - 404 NOT FOUND - Should return 404 HTTP code because message not found',
        404,
      ],
    ])('%s', async (_, code) => {
      if (code === 204) {
        await request(app.getHttpServer())
          .delete(`/api/messages/${messageId}`)
          .expect(204)
          .set('Cookie', [`accessToken=${userAccessToken}`]);
      } else {
        await request(app.getHttpServer())
          .delete(`/api/messages/${code === 404 ? messageId + 1 : messageId}`)
          .set('Cookie', [`accessToken=${guestAccessToken}`])
          .expect(code);
      }
    });
  });
});
