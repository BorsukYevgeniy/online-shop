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

describe('CategoryController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        CategoryModule,
        ConfigModule.forRoot({ envFilePath: '.env.test' , isGlobal: true}),
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
        email: process.env.TEST_EMAIL,
        password: await hash('password', 10),
        nickname: 'user',
        role: 'ADMIN',
      },
    });

    const { headers } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: 'password' })
      .expect(200);

    accessToken = headers['set-cookie'][0].split('=')[1].split(';')[0];
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await app.close();
  });

  describe('GET /categories - Should return all categories and search him', () => {
    it.each<[string, SearchCategoryDto | null]>([
      ['GET /categories - Should return all categories', null],
      ['GET /categories - Should search category by name', { name: 'TEST' }],
    ])('%s', async (_, searchDto) => {
      const mockCategories = {
        categories: [],
        page: 1,
        pageSize: 10,
        prevPage: null,
        nextPage: null,
        total: 0,
        totalPages: 0
      };

      const { body } = await request(app.getHttpServer())
        .get('/categories')
        .query(searchDto)
        .expect(200);

      expect(body).toEqual(mockCategories);
    });
  });

  let categoryId: number;
  describe('POST /categories - Should return create category', () => {
    it.each<[string, 201 | 400, CreateCategoryDto | null]>([
      [
        'POST /categories - 201 CREATED - Should create a new category',
        201,
        { name: 'Category', description: 'Category description' },
      ],
      [
        'POST /categories - 400 BAD REQUEST - Should return 400 because category already exists',
        400,
        null,
      ],
      [
        'POST /categories - 400 BAD REQUEST - Should return 400 because name not valid',
        400,
        { name: '23', description: 'Description' },
      ],
      [
        'POST /categories - 400 BAD REQUEST - Should return 400 because description not valid',
        400,
        { name: 'Category', description: 'De' },
      ],
      [
        'POST /categories - 400 BAD REQUEST - Should return 400 because data not valid',
        400,
        { name: null, description: null },
      ],
    ])('%s', async (_, status, dto) => {
      const { body: category } = await request(app.getHttpServer())
        .post('/categories')
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

  describe('GET /categories/:categoryId - Should get a category by id ', () => {
    it.each<[string, 200 | 404]>([
      [
        'GET /categories/:categoryId - 200 OK - Should get a category by id',
        200,
      ],
      [
        'GET /categories/:categoryId - 404 NOT FOUND - Should return 404 HTTP code because category not founded',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      const { body: category } = await request(app.getHttpServer())
        .get(`/categories/${statusCode === 404 ? categoryId - 1 : categoryId}`)
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

  it('GET /categories/:categoryId/products - 200 OK - Should get a category products', async () => {
    const { body: category } = await request(app.getHttpServer())
      .get(`/categories/${categoryId}/products`)
      .expect(200);

    expect(category).toEqual({
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      prevPage: null,
      nextPage: null,
      products: [],
    });
  });

  describe('PATCH /categories/:categoryId - Should update fields in category', () => {
    it.each<[string, 200 | 404 | 400, UpdateCategoryDto | null]>([
      [
        'PATCH /categories/:categoryId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
        null,
      ],
      [
        'PATCH /categories/:categoryId - 200 OK - Should update name in category',
        200,
        { name: 'New category name' },
      ],
      [
        'PATCH /categories/:categoryId - 200 OK - Should update description in category',
        200,
        { description: 'New category description' },
      ],
      [
        'PATCH /categories/:categoryId - 200 OK - Should update name and description in category',
        200,
        { name: 'New category name', description: 'New category description' },
      ],
      [
        'PATCH /categories/:categoryId - 400 BAD REQUEST - Should return 400 HTTP code because name not valid',
        400,
        { name: 'Na' },
      ],
      [
        'PATCH /categories/:categoryId - 400 BAD REQUEST - Should return 400 HTTP code because description not valid',
        400,
        { description: 'De' },
      ],
      [
        'PATCH /categories/:categoryId - 400 BAD REQUEST - Should return 400 HTTP code because data not valid',
        400,
        { name: 'Na', description: 'De' },
      ],
    ])('%s', async (_, statusCode, dto) => {
      const { body } = await request(app.getHttpServer())
        .patch(
          `/categories/${statusCode === 404 ? categoryId - 1 : categoryId}`,
        )
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(dto)
        .expect(statusCode);

      if (statusCode === 200) {
        expect(body).toMatchObject(dto);
      }
    });
  });

  describe('DELETE /categories/:categoryId - Should delete a category by id', () => {
    it.each<[string, 204 | 404]>([
      [
        'DELETE /categories/:categoryId - 204 NO CONTENT - Should delete a category by id',
        204,
      ],
      [
        'DELETE /categories/:categoryId - 404 NOT FOUND - Should return 404 HTTP code because category not found',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(statusCode);
    });
  });
});
