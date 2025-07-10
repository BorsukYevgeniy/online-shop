import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import { CategoryModule } from '../src/category/category.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { hash } from 'bcryptjs';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';
import { SearchCategoryDto } from 'src/category/dto/search-category.dto';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';

describe('CategoryController (e2e)', () => {
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
        AuthModule,
        CategoryModule,
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  }, 6500);

  let accessToken: string;
  // Створення адміністратора для подальших тестів
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        email: "test@gmail.com",
        password: await hash('password', 3),
        nickname: 'user',
        role: 'ADMIN',
        isVerified: true
      },
    });

    const { headers } = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: "test@gmail.com", password: 'password' });

    accessToken = headers['set-cookie'][0].split('=')[1].split(';')[0];
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await app.close();
  });

  describe('GET /api/categories - Should return all categories and search him', () => {
    it.each<[string, SearchCategoryDto | null]>([
      ['GET /api/categories - Should return all categories', null],
      [
        'GET /api/categories - Should search category by name',
        { name: 'TEST' },
      ],
    ])('%s', async (_, searchDto) => {
      const mockCategories = {
        categories: [],
        page: 1,
        pageSize: 10,
        prevPage: null,
        nextPage: null,
        total: 0,
        totalPages: 0,
      };

      const { body } = await request(app.getHttpServer())
        .get('/api/categories')
        .query(searchDto)
        .expect(200);

      expect(body).toEqual(mockCategories);
    });
  });

  let categoryId: number;
  describe('POST /api/categories - Should return create category', () => {
    it.each<[string, 201 | 400, CreateCategoryDto | null]>([
      [
        'POST /api/categories - 201 CREATED - Should create a new category',
        201,
        { name: 'Category', description: 'Category description' },
      ],
      [
        'POST /api/categories - 400 BAD REQUEST - Should return 400 because category already exists',
        400,
        null,
      ],
      [
        'POST /api/categories - 400 BAD REQUEST - Should return 400 because name not valid',
        400,
        { name: '23', description: 'Description' },
      ],
      [
        'POST /api/categories - 400 BAD REQUEST - Should return 400 because description not valid',
        400,
        { name: 'Category', description: 'De' },
      ],
      [
        'POST /api/categories - 400 BAD REQUEST - Should return 400 because data not valid',
        400,
        { name: null, description: null },
      ],
    ])('%s', async (_, status, dto) => {
      const { body: category } = await request(app.getHttpServer())
        .post('/api/categories')
        .send(dto)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(status);

      if (status === 201) {
        expect(category).toEqual({
          id: expect.any(Number),
          name: 'Category',
          description: 'Category description',
        });
        categoryId = category.id;
      }
    });
  });

  describe('GET /api/categories/:categoryId - Should get a category by id ', () => {
    it.each<[string, 200 | 404]>([
      [
        'GET /api/categories/:categoryId - 200 OK - Should get a category by id',
        200,
      ],
      [
        'GET /api/categories/:categoryId - 404 NOT FOUND - Should return 404 HTTP code because category not founded',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { body: category } = await request(app.getHttpServer())
        .get(
          `/api/categories/${statusCode === 404 ? categoryId - 1 : categoryId}`,
        )
        .expect(statusCode);

      if (statusCode === 200) {
        expect(category).toEqual({
          id: categoryId,
          name: 'Category',
          description: 'Category description',
        });
      }
    });
  });

  describe('PATCH /api/categories/:categoryId - Should update fields in category', () => {
    it.each<[string, 200 | 404 | 400, UpdateCategoryDto | null]>([
      [
        'PATCH /api/categories/:categoryId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
        null,
      ],
      [
        'PATCH /api/categories/:categoryId - 200 OK - Should update name in category',
        200,
        { name: 'New category name' },
      ],
      [
        'PATCH /api/categories/:categoryId - 200 OK - Should update description in category',
        200,
        { description: 'New category description' },
      ],
      [
        'PATCH /api/categories/:categoryId - 200 OK - Should update name and description in category',
        200,
        { name: 'New category name', description: 'New category description' },
      ],
      [
        'PATCH /api/categories/:categoryId - 400 BAD REQUEST - Should return 400 HTTP code because name not valid',
        400,
        { name: 'Na' },
      ],
      [
        'PATCH /api/categories/:categoryId - 400 BAD REQUEST - Should return 400 HTTP code because description not valid',
        400,
        { description: 'De' },
      ],
      [
        'PATCH /api/categories/:categoryId - 400 BAD REQUEST - Should return 400 HTTP code because data not valid',
        400,
        { name: 'Na', description: 'De' },
      ],
    ])('%s', async (_, statusCode, dto) => {
      const { body } = await request(app.getHttpServer())
        .patch(
          `/api/categories/${statusCode === 404 ? categoryId - 1 : categoryId}`,
        )
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(dto)
        .expect(statusCode);

      if (statusCode === 200) {
        expect(body).toMatchObject(dto);
      }
    });
  });

  describe('DELETE /api/categories/:categoryId - Should delete a category by id', () => {
    it.each<[string, 204 | 404]>([
      [
        'DELETE /api/categories/:categoryId - 204 NO CONTENT - Should delete a category by id',
        204,
      ],
      [
        'DELETE /api/categories/:categoryId - 404 NOT FOUND - Should return 404 HTTP code because category not found',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      await request(app.getHttpServer())
        .delete(`/api/categories/${categoryId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(statusCode);
    });
  });
});
