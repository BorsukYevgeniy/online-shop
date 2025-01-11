import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './product.repository';
import { Test } from '@nestjs/testing';

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

  it('should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('should count all products without filter', async () => {
    jest.spyOn(prisma.product, 'count').mockResolvedValue(1);

    const productsCount: number = await repository.count({});

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        title: { contains: undefined, mode: 'insensitive' },
        price: { lte: undefined, gte: undefined },
      },
    });

    expect(productsCount).toEqual(1);
  });

  it('should count all products filtered by title', async () => {
    jest.spyOn(prisma.product, 'count').mockResolvedValue(1);

    const productsCount: number = await repository.count({ title: 'test' });

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        title: { contains: 'test', mode: 'insensitive' },
        price: { lte: undefined, gte: undefined },
      },
    });

    expect(productsCount).toEqual(1);
  });

  it('should count all products filtered by price range', async () => {
    jest.spyOn(prisma.product, 'count').mockResolvedValue(1);

    const productsCount: number = await repository.count({
      minPrice: 20,
      maxPrice: 100,
    });

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        title: { contains: undefined, mode: 'insensitive' },
        price: { lte: 100, gte: 20 },
      },
    });

    expect(productsCount).toEqual(1);
  });

  it('should count all products filtered by title and price range', async () => {
    jest.spyOn(prisma.product, 'count').mockResolvedValue(1);

    const productsCount: number = await repository.count({
      title: 'test',
      minPrice: 10,
      maxPrice: 100,
    });

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        title: { contains: 'test', mode: 'insensitive' },
        price: { lte: 100, gte: 10 },
      },
    });

    expect(productsCount).toEqual(1);
  });

  it('should return all products without filters', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Product A',
        price: 100,
        userId: 1,
        description: 'MOCK1 description',
        images: ['1', '2'],
      },
      {
        id: 2,
        title: 'Product B',
        price: 50,
        userId: 2,
        description: 'MOCK2 description',
        images: ['3', '4'],
      },
    ];

    jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

    const products = await repository.findAll({}, 0, 10);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        title: {
          contains: undefined,
          mode: 'insensitive',
        },
        price: {
          gte: undefined,
          lte: undefined,
        },
      },
      include: {
        categories: true,
      },
      skip: 0,
      take: 10,
    });
    expect(products).toEqual(mockProducts);
  });

  it('should filter products by title', async () => {
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

    jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

    const products = await repository.findAll({ title: 'Test' }, 0, 10);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        title: { contains: 'Test', mode: 'insensitive' },
        price: {
          gte: undefined,
          lte: undefined,
        },
      },
      include: {
        categories: true,
      },
      skip: 0,
      take: 10,
    });
    expect(products).toEqual(mockProducts);
  });

  it('should filter products by price range', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Product A',
        price: 150,
        userId: 4,
        description: 'Test description',
        images: ['7', '8'],
      },
    ];

    jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

    const products = await repository.findAll(
      { minPrice: 100, maxPrice: 200 },
      0,
      10,
    );

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        title: {
          contains: undefined,
          mode: 'insensitive',
        },
        price: {
          gte: 100,
          lte: 200,
        },
      },
      include: {
        categories: true,
      },
      skip: 0,
      take: 10,
    });
    expect(products).toEqual(mockProducts);
  });

  it('should filter products by title and price range', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Test Product',
        price: 150,
        userId: 3,
        images: ['5', '6'],
        description: 'Test description',
      },
    ];

    jest.spyOn(prisma.product, 'findMany').mockResolvedValue(mockProducts);

    const products = await repository.findAll(
      {
        title: 'Test',
        minPrice: 100,
        maxPrice: 200,
      },
      0,
      10,
    );

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        title: { contains: 'Test', mode: 'insensitive' },
        price: {
          gte: 100,
          lte: 200,
        },
      },
      include: {
        categories: true,
      },
      skip: 0,
      take: 10,
    });
    expect(products).toEqual(mockProducts);
  });

  it('should find product by id', async () => {
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

  it('should create product', async () => {
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

  it('should update all fields in product', async () => {
    const productId = 1;
    const updateDto: UpdateProductDto = {
      title: 'Updated Title',
      description: 'Updated Description',
      price: 100,
    };
    const imageNames = ['image1.jpg', 'image2.jpg'];

    const mockProduct = {
      id: productId,
      userId: 1,
      title: updateDto.title,
      description: updateDto.description,
      price: 100,
      images: imageNames,
    };

    jest.spyOn(prisma.product, 'update').mockResolvedValue(mockProduct);

    const product = await repository.update(productId, updateDto, imageNames);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: productId },
      data: {
        title: updateDto.title,
        description: updateDto.description,
        price: 100,
        images: imageNames,
      },
      include: {
        categories: true,
      },
    });

    expect(product).toEqual(mockProduct);
  });

  it('should update only title in product', async () => {
    const productId = 1;
    const updateDto: UpdateProductDto = {
      title: 'Updated Title',
    };

    const mockProduct = {
      id: productId,
      userId: 1,
      title: updateDto.title,
      description: 'Old Description',
      price: 50,
      images: ['image1.jpg'],
    };

    jest.spyOn(prisma.product, 'update').mockResolvedValue(mockProduct);

    const product = await repository.update(productId, updateDto);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: productId },
      data: {
        categories: undefined,
        description: undefined,
        price: undefined,
        title: updateDto.title,
        images: undefined,
      },
      include: {
        categories: true,
      },
    });

    expect(product).toEqual(mockProduct);
  });

  it('should update only price in product', async () => {
    const productId = 1;
    const dto: UpdateProductDto = {
      price: 52,
    };

    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: dto.price,
      images: ['image1.jpg'],
    };

    jest.spyOn(prisma.product, 'update').mockResolvedValue(mockProduct);

    const product = await repository.update(productId, dto);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: productId },
      data: {
        categories: undefined,
        price: dto.price,
        title: undefined,
        images: undefined,
      },
      include: { categories: true },
    });

    expect(product).toEqual(mockProduct);
  });

  it('should update images in product', async () => {
    const productId = 1;
    const images = ['1.jpg'];

    const dto: UpdateProductDto = {};
    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: 50,
      images,
    };

    jest.spyOn(prisma.product, 'update').mockResolvedValue(mockProduct);

    const product = await repository.update(productId, dto, images);
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: productId },
      data: {
        categories: undefined,
        description: undefined,
        images: images,
        price: undefined,
        title: undefined,
      },
      include: { categories: true },
    });

    expect(product).toEqual(mockProduct);
  });

  it('should delete product by id', async () => {
    const productId = 1;
    const userId = 1;
    const mockProduct = {
      id: productId,
      userId,
      price: 22,
      title: 'TEST',
      description: 'Test',
      images: ['13', '14'],
    };

    jest.spyOn(prisma.product, 'delete').mockResolvedValue(mockProduct);

    const product = await repository.delete(productId);

    expect(prisma.product.delete).toHaveBeenCalledWith({
      where: { id: productId },
      include: {
        categories: true,
      },
    });

    expect(product).toEqual(mockProduct);
  });
});
