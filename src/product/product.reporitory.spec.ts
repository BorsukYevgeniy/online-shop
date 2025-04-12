import { Order } from '../enum/order.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './product.repository';
import { Test } from '@nestjs/testing';
import { SearchProductDto } from './dto/search-product.dto';
import { Product } from '@prisma/client';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: PrismaService,
          useValue: {
            product: {
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('Should count products in category', async () => {
    jest.spyOn(prisma.product, 'count').mockResolvedValue(1);

    const productsCount = await repository.countCategoryProducts(1);

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        categories: {
          some: {
            id: 1,
          },
        },
      },
    });

    expect(productsCount).toEqual(1);
  });

  it('Should count user products', async () => {
    jest.spyOn(prisma.product, 'count').mockResolvedValue(1);

    const productsCount = await repository.countUserProducts(1);

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
    });

    expect(productsCount).toEqual(1);
  });

  describe('Should count products with filters', () => {
    it.each<[string, SearchProductDto | null]>([
      ['Should count all products', null],
      ['Should count all products by title', { title: 'test' }],
      [
        'Should count all products by title and categories',
        { title: 'test', categoryIds: [1, 2] },
      ],
      [
        'Should count all products by title and min price',
        { title: 'test', minPrice: 20 },
      ],
      [
        'Should count all products by title and max price',
        { title: 'test', maxPrice: 100 },
      ],
      [
        'Should count all products by title and price range',
        { title: 'test', maxPrice: 100, minPrice: 20 },
      ],
      [
        'Should count all products by title ,price range and categories',
        { title: 'test', maxPrice: 100, minPrice: 20, categoryIds: [1, 2] },
      ],
    ])('%s', async (_, searchProductDto) => {
      jest.spyOn(prisma.product, 'count').mockResolvedValue(10);

      const productsCount: number = await repository.count(searchProductDto);

      expect(productsCount).toEqual(10);
    });
  });

  it('Should find user products with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Product A',
        price: 100,
        userId: 1,
        description: 'MOCK1 description',
        images: ['1', '2'],
      },
    ];

    jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

    const products = await repository.findUserProducts(1, 0, 10, {
      sortBy: 'id',
      order: Order.DESC,
    });

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
      skip: 0,
      take: 10,
      orderBy: { id: 'desc' },
    });

    expect(products).toEqual(mockProducts);
  });

  it('Should find products in category with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Product A',
        price: 100,
        userId: 1,
        description: 'MOCK1 description',
        images: ['1', '2'],
      },
    ];

    jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

    const products = await repository.findCategoryProducts(1, 0, 10, {
      sortBy: 'id',
      order: Order.DESC,
    });

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        categories: {
          some: {
            id: 1,
          },
        },
      },
      skip: 0,
      take: 10,
      orderBy: { id: 'desc' },
    });

    expect(products).toEqual(mockProducts);
  });

  it('Should return all products with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Product A',
        price: 100,
        userId: 1,
        description: 'MOCK1 description',
        images: ['1', '2'],
      },
    ];

    jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

    const products = await repository.findAll(0, 10, {
      sortBy: 'id',
      order: Order.DESC,
    });

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { id: 'desc' },
    });
    expect(products).toEqual(mockProducts);
  });

  describe('Should search products with filters', () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Test Product',
        price: 150,
        description: 'Test description',
        userId: 5,
        images: ['9', '10'],
      },
    ];
    it.each<[string, SearchProductDto]>([
      [
        'Should search products by title with default sorting',
        { title: 'Test' },
      ],
      [
        'Should search products by title and min price with default sorting',
        { title: 'Test', minPrice: 100 },
      ],
      [
        'Should search products by title and max price with default sorting',
        { title: 'Test', maxPrice: 200 },
      ],
      [
        'Should search product by title and categories with default sorting',
        { title: 'Test', categoryIds: [1] },
      ],
      [
        'Should search products by title and price range with default sorting',
        { title: 'Test', minPrice: 100, maxPrice: 200 },
      ],
      [
        'Should search products by title ,price range and cateogories with default sorting',
        { title: 'Test', minPrice: 100, maxPrice: 200, categoryIds: [1] },
      ],
    ])('%s', async (_, dto) => {
      jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

      const products = await repository.findProducts(dto, 0, 10, {
        sortBy: 'id',
        order: Order.DESC,
      });

      expect(products).toEqual(mockProducts);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          title: { contains: dto.title, mode: 'insensitive' },
          price: {
            gte: dto.minPrice,
            lte: dto.maxPrice,
          },
          categories: {
            some: {
              id: {
                in: dto.categoryIds,
              },
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { id: 'desc' },
      });
    });
  });

  it('Should find product by id', async () => {
    const productId = 3;
    const mockProduct = {
      id: productId,
      userId: 2,
      title: 'TEST',
      price: 52,
      description: 'Test description',
      images: ['11', '12'],
    };

    jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(mockProduct);

    const product = await repository.findById(productId);

    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: productId },
      include: {
        categories: true,
      },
    });

    expect(product).toEqual(mockProduct);
  });

  it('Should create product', async () => {
    const userId = 1;
    const dto: CreateProductDto = {
      title: 'TEST',
      description: 'Test description',
      price: 69,
      categoryIds: [1],
    };
    const images = ['1'];

    const mockProduct = {
      id: 1,
      title: dto.title,
      price: dto.price,
      userId,
      description: dto.description,
      images,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(prisma.product, 'create').mockResolvedValue(mockProduct);

    const product = await repository.create(userId, dto, images);

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        userId,
        title: dto.title,
        price: dto.price,
        description: dto.description,
        images,
        categories: {
          connect: [
            {
              id: 1,
            },
          ],
        },
      },
      include: {
        categories: true,
      },
    });

    expect(product).toEqual(mockProduct);
  });

  describe('Should update product', () => {
    const mockProduct = {
      id: 1,
      title: 'TEST',
      price: 52,
      description: 'Test description',
      images: ['image1.jpg', 'image2.jpg'],
      userId: 1,
      // categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    it.each<[string, UpdateProductDto, string[] | null]>([
      ['Should update title in product', { title: 'Updated Title' }, null],
      ['Should update price in product', { price: 52 }, null],
      ['Should update images in product', {}, ['image1.jpg']],
      [
        'Should update all fields in product',
        {
          title: 'Updated Title',
          description: 'Updated Description',
          price: 100,
          categoryIds: [1],
        },
        ['image1.jpg', 'image2.jpg'],
      ],
    ])('%s', async (_, updateProductDto, imagesNames) => {
      jest.spyOn(prisma.product, 'update').mockResolvedValue(mockProduct);

      const product = await repository.update(
        mockProduct.id,
        updateProductDto,
        imagesNames,
      );

      expect(product).toEqual(mockProduct);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
        data: {
          title: updateProductDto.title,
          price: updateProductDto.price,
          description: updateProductDto.description,
          images: imagesNames,
          categories: {
            set: updateProductDto.categoryIds?.map((id) => ({ id })),
          },
        },
        include: { categories: true },
      });
    });
  });

  ;
  it('Should delete product by id', async () => {
    await repository.delete(1);

    expect(prisma.product.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
