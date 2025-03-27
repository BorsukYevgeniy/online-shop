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

  it('GET /products/:productId - 200 OK - Should return the product by id', async () => {
    const { body: product } = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200);

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

  it('GET /products/:productId - 404 NOT FOUND - Should return 404 HTTP code', async () => {
    await request(app.getHttpServer())
      .get(`/products/${productId -1}`)
      .expect(404);
  });

  it('GET /products/search - 200 OK - Should search the product by title', async () => {
    const { body: product } = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .query({ title: 'Prod' })
      .expect(200);

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

  it('GET /products/search - 200 OK - Should search the product by title and min price', async () => {
    const { body: product } = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .query({ title: 'Prod' })
      .query({ minPrice: 50 })
      .expect(200);

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

  it('GET /products/search - 200 OK - Should search the product by title and max price', async () => {
    const { body: product } = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .query({ title: 'Prod' })
      .query({ maxPrice: 150 })
      .expect(200);

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

  it('GET /products/search - 200 OK - Should search the product by title and price range', async () => {
    const { body: product } = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .query({ title: 'Prod' })
      .query({ maxPrice: 150 })
      .query({ minPrice: 50 })
      .expect(200);

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

  it('GET /products/search - 200 OK - Should search the product by title and categories', async () => {
    const { body: product } = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .query({ title: 'Prod' })
      .query({ categoryIds: [category1Id] })
      .expect(200);

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

  it('GET /products/search - 200 OK - Should search the product by title ,categories and price range', async () => {
    const { body: product } = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .query({ title: 'Prod' })
      .query({ categoryIds: [category1Id] })
      .query({ maxPrice: 150 })
      .query({ mштPrice: 50 })
      .expect(200);

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

  it('PATCH /products/:productId - 200 OK - Should update title in product', async () => {
    const dto: UpdateProductDto = { title: 'New Product' };
    const { body: product } = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(dto)
      .expect(200);

    expect(product).toEqual({
      id: expect.any(Number),
      title: dto.title,
      description: 'Description',
      price: 100,
      categories: [
        { id: category1Id, name: 'category', description: 'description' },
      ],
      images: expect.any(Array<String>),
      userId,
    });
  });

  it('PATCH /products/:productId - 404 NOT FOUND - Should return 404 HTTP code', async () => {
    const dto: UpdateProductDto = { title: 'New Product' };
    await request(app.getHttpServer())
      .patch(`/products/${productId -1}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(dto)
      .expect(404);
  });

  it('PATCH /products/:productId - 200 OK - Should update description in product', async () => {
    const dto: UpdateProductDto = { description: 'New description' };
    const { body: product } = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(dto)
      .expect(200);

    expect(product).toEqual({
      id: expect.any(Number),
      title: 'New Product',
      description: dto.description,
      price: 100,
      categories: [
        { id: category1Id, name: 'category', description: 'description' },
      ],
      images: expect.any(Array<String>),
      userId,
    });
  });

  it('PATCH /products/:productId - 200 OK - Should update price in product', async () => {
    const dto: UpdateProductDto = { price: 125 };
    const { body: product } = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(dto)
      .expect(200);

    expect(product).toEqual({
      id: expect.any(Number),
      title: 'New Product',
      description: 'New description',
      price: dto.price,
      categories: [
        { id: category1Id, name: 'category', description: 'description' },
      ],
      images: expect.any(Array<String>),
      userId,
    });
  });

  it('PATCH /products/:productId - 200 OK - Should update price in product', async () => {
    const dto: UpdateProductDto = { categoryIds: [category2Id] };
    const { body: product } = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(dto)
      .expect(200);

    expect(product).toEqual({
      id: expect.any(Number),
      title: 'New Product',
      description: 'New description',
      price: 125,
      categories: [
        {
          id: dto.categoryIds[0],
          name: 'category2',
          description: 'description2',
        },
      ],
      images: expect.any(Array<String>),
      userId,
    });
  });

  it('PATCH /products/:productId - 200 OK - Should update images in product', async () => {
    const { body: product } = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .attach('images', Buffer.from('mockImageData2'), 'file2.jpg')
      .expect(200);

    expect(product).toEqual({
      id: expect.any(Number),
      title: 'New Product',
      description: 'New description',
      price: 125,
      categories: [
        { id: category2Id, name: 'category2', description: 'description2' },
      ],
      images: expect.any(Array<String>),
      userId,
    });
  });

  it('PATCH /products/:productId - 200 OK - Should update all fields in product', async () => {
    const dto = {
      title: 'New Product2',
      description: 'New description2',
      price: 120,
      categoryIds: [category1Id],
    };
    const { body: product } = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .field('title', dto.title)
      .field('description', dto.description)
      .field('price', dto.price)
      .field('categoryIds', dto.categoryIds)
      .attach('images', Buffer.from('mockImageData2'), 'file2.jpg')
      .expect(200);

    expect(product).toEqual({
      id: expect.any(Number),
      title: dto.title,
      description: dto.description,
      price: dto.price,
      categories: [
        {
          id: dto.categoryIds[0],
          name: 'category',
          description: 'description',
        },
      ],
      images: expect.any(Array<String>),
      userId,
    });
  });

  it('DELETE /products/:productId - 204 NO CONTENT - Should delete product', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(204)
      .expect({});
  });

  it('DELETE /products/:productId - 404 NOT FOUND - Should return 404 HTTP code', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${productId -1}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(404)
  });
});
