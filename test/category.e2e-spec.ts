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

describe('CategoryController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        CategoryModule,
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
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
        email: 'user@gmail.com',
        password: await hash('password', 10),
        nickname: 'user',
        role: 'ADMIN'
      },
    });

    const { headers } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@gmail.com', password: 'password' })
      .expect(200);

    accessToken = headers['set-cookie'][0].split('=')[1].split(';')[0];
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await app.close();
  });

  it('GET /categories - 200 OK - Should get all categories', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(res.body).toEqual({
      categories: [],
      total: 0,
      pageSize: 10,
      page: 1,
      totalPages: 0,
      prevPage: null,
      nextPage: null,
    });
  });

  let categoryId: number;
  it('POST /categories - 201 CREATED - Should create a new category', async () => {
    const { body: category } = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Category', description: 'Category description' })
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(201);

    categoryId = category.id;

    expect(category).toEqual({
      id: expect.any(Number),
      name: 'Category',
      description: 'Category description',
    });
  });

  it("GET /categories/:categoryId - 200 OK - Should get a category by it's id", async () => {
    const { body: category } = await request(app.getHttpServer())
      .get(`/categories/${categoryId}`)
      .expect(200);

    expect(category).toEqual({
      id: categoryId,
      name: 'Category',
      description: 'Category description',
    });
  });

  it('GET /categories/search - 200 OK - Should search categories by name', async () => {
    const { body: categories } = await request(app.getHttpServer())
      .get('/categories/search')
      .query({ name: 'Categ' })
      .expect(200);

    expect(categories).toEqual({
      total: 1,
      prevPage: null,
      nextPage: null,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      categories: [
        {
          id: categoryId,
          name: 'Category',
          description: 'Category description',
        },
      ],
    });
  });

  it('GET /categories/:categoryId/products - 200 OK - Should get a category prpducts', async () => {
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

  it('PATCH /categories/:categoryId - 200 OK - Should update name in category', async () => {
    const { body: category } = await request(app.getHttpServer())
      .patch(`/categories/${categoryId}`)
      .send({ name: 'New category name' })
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    expect(category).toEqual({
      id: categoryId,
      name: 'New category name',
      description: 'Category description',
    });
  });

  it('PATCH /categories/:categoryId - 200 OK - Should update name and description in category', async () => {
    const { body: category } = await request(app.getHttpServer())
      .patch(`/categories/${categoryId}`)
      .send({
        name: 'New category name',
        description: 'New category description',
      })
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);

    expect(category).toEqual({
      id: categoryId,
      name: 'New category name',
      description: 'New category description',
    });
  });

  it('DELETE /categories/:categoryId - 204 NO CONTENT - Should delete a category by id', async () => {
    await request(app.getHttpServer())
      .delete(`/categories/${categoryId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(204)
      .expect({});
  });
});
