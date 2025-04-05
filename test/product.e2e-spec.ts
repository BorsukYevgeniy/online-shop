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
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { SearchProductDto } from 'src/product/dto/search-product.dto';

describe('ProductController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ProductModule,
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

  let accessToken: string;
  let category1Id: number, category2Id: number;
  let userId: number;
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'user@gmail.com',
        password: await hash('password', 10),
        nickname: 'user',
      },
      select: { id: true },
    });

    const { headers } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@gmail.com', password: 'password' });

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

  it('GET /products - 200 OK - Should return all products', async () => {
    const { body: products } = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(products).toEqual({
      total: 0,
      prevPage: null,
      nextPage: null,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      products: [],
    });
  });

  let productId: number;
  it('POST /products - 201 CREATED - Should create a product', async () => {
    const { body: product } = await request(app.getHttpServer())
      .post('/products')
      .set('Cookie', [`accessToken=${accessToken}`])
      .field('title', 'Product')
      .field('description', 'Description')
      .field('price', 100)
      .field('categoryIds', [category1Id])
      .attach('images', Buffer.from('mockImageData'), 'file1.jpg')
      .expect(201);

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
  });

  describe('GET /products/:productId - Should find the product by id', () => {
    it.each<[string, 200 | 404]>([
      [
        'GET /products/:productId - 200 OK - Should return the product by id',
        200,
      ],
      [
        'GET /products/:productId - 404 NOT FOUND - Should return 404 HTTP code',
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

  describe('GET /products/search - Should search product', () => {
    it.each<[string, SearchProductDto]>([
      [
        'GET /products/search - 200 OK - Should search the product by title',
        { title: 'Prod' },
      ],
      [
        'GET /products/search - 200 OK - Should search the product by title and min price',

        { title: 'Prod', minPrice: 50 },
      ],
      [
        'GET /products/search - 200 OK - Should search the product by title and max price',
        { title: 'Prod', maxPrice: 150 },
      ],
      [
        'GET /products/search - 200 OK - Should search the product by title and price range',
        { title: 'Prod', minPrice: 50, maxPrice: 150 },
      ],
      [
        'GET /products/search - 200 OK - Should search the product by title and categories',
        { title: 'Prod', categoryIds: [category1Id] },
      ],
      [
        'GET /products/search - 200 OK - Should search the product by title ,categories and price range',
        {
          title: 'Prod',
          categoryIds: [category1Id],
          minPrice: 50,
          maxPrice: 150,
        },
      ],
    ])('%s', async (_, dto) => {
      const { body } = await request(app.getHttpServer())
        .get('/products/search')
        .query(dto)
        .expect(200);

      expect(body).toEqual({
        nextPage: null,
        total: 1,
        totalPages: 1,
        page: 1,
        pageSize: 10,
        prevPage: null,
        products: [
          {
            id: expect.any(Number),
            title: 'Product',
            description: 'Description',
            price: 100,
            images: expect.any(Array<String>),
            userId,
          },
        ],
      });
    });
  });

  describe('PATCH /products/:productId - Should update title in product', () => {
    it.each<[string, number, UpdateProductDto | null, Buffer | null]>([
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
    ])('%s', async (_, status, dto, file) => {
      const requestBuilder = request(app.getHttpServer())
        .patch(`/products/${status === 404 ? productId - 1 : productId}`)
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

      const res = await requestBuilder.expect(status);

      if (status === 200) {
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
    ])('%s', async (_, status) => {
      await request(app.getHttpServer())
        .delete(`/products/${status === 404 ? productId - 1 : productId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(status);
    });
  });
});
