import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TestingModule, Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductModule } from '../src/product/product.module';
import { hash } from 'bcryptjs';
import { UpdateProductDto } from '../src/product/dto/update-product.dto';
import { SearchProductDto } from '../src/product/dto/search-product.dto';
import { CreateProductDto } from '../src/product/dto/create-product.dto';

describe('ProductController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ProductModule,
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

  let accessToken: string;
  let category1Id: number, category2Id: number;
  let userId: number;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: process.env.TEST_EMAIL,
        password: await hash('password', 10),
        nickname: 'user',
        isVerified: true,
        verifiedAt: new Date()
      },
      select: { id: true },
    });

    const { headers } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: 'password' });

    const [category1, category2] = await Promise.all([
      prisma.category.create({
        data: { name: 'category', description: 'description' },
      }),
      prisma.category.create({
        data: { name: 'category2', description: 'description2' },
      }),
    ]);

    category1Id = category1.id;
    category2Id = category2.id;
    accessToken = headers['set-cookie'][0].split('=')[1].split(';')[0];
    userId = user.id;
  }, 6500);

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await app.close();
  });

  describe('GET /products - 200 OK - Should return all products and search him', () => {
    it.each<[string, 200 | 400, SearchProductDto | null]>([
      [
        'GET /products - 200 OK - Should return all products',
        200,
        null,
      ],
      [
        'GET /products - 200 OK - Should search the product by title',
        200,
        { title: 'Prod' },
      ],
      [
        'GET /products - 200 OK - Should get category products',
        200,
        { categoryIds: [1] },
      ],
      [
        'GET /products - 200 OK - Should search the product by title and min price',
        200,
        { title: 'Prod', minPrice: 50 },
      ],
      [
        'GET /products - 200 OK - Should search the product by title and max price',
        200,
        { title: 'Prod', maxPrice: 150 },
      ],
      [
        'GET /products - 200 OK - Should search the product by title and price range',
        200,
        { title: 'Prod', minPrice: 50, maxPrice: 150 },
      ],
      [
        'GET /products - 200 OK - Should search the product by title and categories',
        200,
        { title: 'Prod', categoryIds: [category1Id] },
      ],
      [
        'GET /products - 200 OK - Should search the product by title ,categories and price range',
        200,
        {
          title: 'Prod',
          categoryIds: [category1Id],
          minPrice: 50,
          maxPrice: 150,
        },
      ],
      [
        'GET /products - 400 BAD REQUEST - Should return 400 HTTP code because title not valid',
        400,
        { title: '' },
      ],
      [
        'GET /products - 400 BAD REQUEST - Should return 400 HTTP code because minPrice not valid',
        400,
        { title: 'Title', minPrice: -1 },
      ],
      [
        'GET /products - 400 BAD REQUEST - Should return 400 HTTP code because maxPrice not valid',
        400,
        { title: 'Title', maxPrice: -1 },
      ],
      [
        'GET /products - 400 BAD REQUEST - Should return 400 HTTP code because data not valid',
        400,
        { title: 'T', minPrice: -1, maxPrice: -10, categoryIds: [category1Id] },
      ],
    ])('%s', async (_, statusCode, dto) => {
      const { body } = await request(app.getHttpServer())
        .get('/products')
        .query(dto)
        .expect(statusCode);

      if (statusCode === 200) {
        expect(body).toEqual({
          nextPage: null,
          total: 0,
          totalPages: 0,
          page: 1,
          pageSize: 10,
          prevPage: null,
          products: [],
        });
      }
    });
  });

  let productId: number;
  describe('POST /product - Should create a product', () => {
    it.each<[string, 201 | 400, CreateProductDto | null, Buffer | null]>([
      [
        'POST /product - 200 OK - Should create a product',
        201,
        {
          title: 'Product',
          price: 100,
          description: 'Description',
          categoryIds: [category1Id],
        },
        Buffer.from('mockImageData'),
      ],
      [
        'POST /product - 400 BAD REQUEST - Should return 400 HTTP code because title not valid',
        400,
        {
          title: 's',
          price: 100,
          description: 'Description',
          categoryIds: [category1Id],
        },
        null,
      ],
      [
        'POST /product - 400 BAD REQUEST - Should return 400 HTTP code because price not valid',
        400,
        {
          title: 'Title',
          price: -100,
          description: 'Description',
          categoryIds: [category1Id],
        },
        null,
      ],
      [
        'POST /product - 400 BAD REQUEST - Should return 400 HTTP code because description not valid',
        400,
        {
          title: 'Title',
          price: 100,
          description: 'De',
          categoryIds: [category1Id],
        },
        null,
      ],
    ])('%s', async (_, statusCode, dto, file) => {
      const requestBuilder = request(app.getHttpServer())
        .post('/products')
        .set('Cookie', [`accessToken=${accessToken}`]);

      if (dto) {
        Object.entries(dto).forEach(([key, value]) => {
          if (key && value) {
            requestBuilder.field(
              key,
              key === 'categoryIds' ? [category1Id] : value,
            );
          }
        });
      }

      if (file) {
        requestBuilder.attach('images', file);
      }

      const { body: product } = await requestBuilder.expect(statusCode);

      if (statusCode === 201) {
        productId = product.id;

        expect(product).toEqual({
          id: expect.any(Number),
          title: 'Product',
          description: 'Description',
          price: 100,
          categories: [
            { id: category1Id, name: 'category', description: 'description' },
          ],
          images: expect.any(Array<String>),
          userId,
        });
      }
    });
  });

  describe('GET /products/:productId - Should find the product by id', () => {
    it.each<[string, 200 | 404]>([
      [
        'GET /products/:productId - 200 OK - Should return the product by id',
        200,
      ],
      [
        'GET /products/:productId - 404 NOT FOUND - Should return 404 HTTP code because product not found',
        404,
      ],
    ])('%s', async (_, status) => {
      const { body: product } = await request(app.getHttpServer())
        .get(`/products/${status === 404 ? productId - 1 : productId}`)
        .expect(status);

      if (status === 200) {
        expect(product).toEqual({
          id: expect.any(Number),
          title: 'Product',
          description: 'Description',
          price: 100,
          categories: [
            { id: category1Id, name: 'category', description: 'description' },
          ],
          images: expect.any(Array<String>),
          userId,
        });
      }
    });
  });

  describe('PATCH /products/:productId - Should update product', () => {
    it.each<[string, 200 | 400 | 404, UpdateProductDto | null, Buffer | null]>([
      [
        'PATCH /products/:productId - 200 OK - Should update title in product',
        200,
        { title: 'New Title' },
        null,
      ],
      [
        'PATCH /products/:productId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
        null,
        null,
      ],
      [
        'PATCH /products/:productId - 200 OK - Should update description in product',
        200,
        { description: 'New Description' },
        null,
      ],
      [
        'PATCH /products/:productId - 200 OK - Should update price in product',
        200,
        { price: 125 },
        null,
      ],
      [
        'PATCH /products/:productId - 200 OK - Should update categories in product',
        200,
        { categoryIds: [category2Id] },
        null,
      ],
      [
        'PATCH /products/:productId - 400 BAD REQUEST - Should return 400 HTTP code because title not valid',
        400,
        { title: 'T' },
        null,
      ],
      [
        'PATCH /products/:productId - 400 BAD REQUEST - Should return 400 HTTP code because price not valid',
        400,
        { price: -1 },
        null,
      ],
      [
        'PATCH /products/:productId - 400 BAD REQUEST - Should return 400 HTTP code because description not valid',
        400,
        { description: 'De' },
        null,
      ],

      [
        'PATCH /products/:productId - 400 BAD REQUEST - Should return 400 HTTP code because data not valid',
        400,
        { title: '', price: -1, description: '' },
        null,
      ],
    ])('%s', async (_, statusCode, dto, file) => {
      const requestBuilder = request(app.getHttpServer())
        .patch(`/products/${statusCode === 404 ? productId - 1 : productId}`)
        .set('Cookie', [`accessToken=${accessToken}`]);

      if (dto) {
        Object.entries(dto).forEach(([key, value]) => {
          if (key && value) {
            requestBuilder.field(
              key,
              key === 'categoryIds' ? [category2Id] : value,
            );
          }
        });
      }

      if (file) {
        requestBuilder.attach('images', file);
      }

      const res = await requestBuilder.expect(statusCode);

      if (statusCode === 200) {
        if (dto.categoryIds)
          expect(res.body.categories).toEqual([
            {
              id: category2Id,
              name: 'category2',
              description: 'description2',
            },
          ]);
        else {
          expect(res.body).toMatchObject(dto);
        }
      }
    });
  });

  describe('DELETE /products/:productId - Should delete product', () => {
    it.each<[string, 204 | 404]>([
      [
        'DELETE /products/:productId - 204 NO CONTENT - Should delete product',
        204,
      ],
      [
        'DELETE /products/:productId - 404 NOT FOUND - Should return 404 HTTP code',
        404,
      ],
    ])('%s', async (_, statusCode) => {
      await request(app.getHttpServer())
        .delete(`/products/${statusCode === 404 ? productId - 1 : productId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(statusCode);
    });
  });
});
