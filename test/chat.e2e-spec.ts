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
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  let userId: number, adminId: number, guestId: number;
  let userAccessToken: string,
    adminAccessToken: string,
    guestAccessToken: string;
  beforeAll(async () => {
    const password = await hash('123456', 3);

    const user = await prisma.user.create({
      data: {
        email: 'test@gmail.com',
        password,
        nickname: 'user1',
        isVerified: true,
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'test2@gmail.com',
        password,
        nickname: 'user2',
        isVerified: true,
        role: 'ADMIN',
      },
    });

    const guest = await prisma.user.create({
      data: {
        email: 'test3@gmail.com',
        password,
        nickname: 'user3',
        isVerified: true,
        role: 'ADMIN',
      },
    });

    userId = user.id;
    adminId = admin.id;
    guestId = guest.id;

    const { headers: userHeaders } = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: '123456' });

    userAccessToken = userHeaders['set-cookie'][0].split('=')[1].split(';')[0];

    const { headers: guestHeaders } = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: guest.email, password: '123456' });

    guestAccessToken = guestHeaders['set-cookie'][0]
      .split('=')[1]
      .split(';')[0];
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.chat.deleteMany({});
  });

  let chatId: number;
  describe('POST /api/chats - Should create chat', () => {
    it.each<[string, 201 | 400 | 404]>([
      ['POST /api/chats - 201 CREATED - Should create chat', 201],
      [
        'POST /api/chats - 400 BAD REQUEST - Should return 400 HTTP code because cannot create chat with himself',
        400,
      ],
      [
        'POST /api/chats - 404 NOT FOUND - Should return 404 HTTP code because cannot user not found',
        404,
      ],
    ])('%s', async (_, code) => {
      const dto: CreateChatDto = { buyerId: userId, sellerId: adminId };
      if (code === 201) {
        const { body } = await request(app.getHttpServer())
          .post('/api/chats')
          .send(dto)
          .set('Cookie', [`accessToken=${userAccessToken}`])
          .expect(code);

        expect(body).toEqual({ id: expect.any(Number) });

        console.log(body.id);

        chatId = body.id;
      } else {
        await request(app.getHttpServer())
          .post('/api/chats')
          .send({ ...dto, sellerId: code === 404 ? adminId + 2 : userId })
          .set('Cookie', [`accessToken=${userAccessToken}`])
          .expect(code);
      }
    });
  });

  it('GET /api/chats - 200 OK - Should return user chats', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api/chats')
      .set('Cookie', [`accessToken=${userAccessToken}`])
      .expect(200);

    expect(body).toEqual([{ id: chatId, withWhom: 'user2' }]);
  });

  describe('GET /api/chats/:chatId - Should get chat by id', () => {
    it.each<[string, 200 | 403 | 404]>([
      [
        'GET /api/chats/:chatId - 403 FORBIDDEN - Should return 403 HTTP code because user isnt participant of this chat',
        403,
      ],
      ['GET /api/chats/:chatId - 200 OK - Should return chat by id', 200],
      [
        'GET /api/chats/:chatId - 404 NOT FOUND - Should return 404 HTTP code because chat not found',
        404,
      ],
    ])('%s', async (_, code) => {
      if (code === 200) {
        const { body } = await request(app.getHttpServer())
          .get(`/api/chats/${chatId}`)
          .set('Cookie', [`accessToken=${userAccessToken}`])
          .expect(200);

        expect(body).toEqual({ id: chatId, messages: [] });
      } else {
        await request(app.getHttpServer())
          .get(`/api/chats/${code === 404 ? chatId + 1 : chatId}`)
          .set('Cookie', [`accessToken=${guestAccessToken}`])
          .expect(code);
      }
    });
  });


  describe('DELETE /api/chats/:chatId - Should DELETE chat by id', () => {
    it.each<[string, 200 | 403 | 404]>([
      [
        'DELETE /api/chats/:chatId - 403 FORBIDDEN - Should return 403 HTTP code because user isnt participant of this chat',
        403,
      ],
      ['DELETE /api/chats/:chatId - 200 OK - Should delete chat by id', 200],
      [
        'DELETE /api/chats/:chatId - 404 NOT FOUND - Should return 404 HTTP code because chat not found',
        404,
      ],
    ])('%s', async (_, code) => {
      if (code === 200) {
        const { body } = await request(app.getHttpServer())
          .delete(`/api/chats/${chatId}`)
          .set('Cookie', [`accessToken=${userAccessToken}`])
          .expect(200);

        expect(body).toEqual({ id: chatId });
      } else {
        await request(app.getHttpServer())
          .delete(`/api/chats/${code === 404 ? chatId + 1 : chatId}`)
          .set('Cookie', [`accessToken=${guestAccessToken}`])
          .expect(code);
      }
    });
  });


});
