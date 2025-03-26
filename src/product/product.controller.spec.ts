import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TokenService } from '../token/token.service';
import { AuthRequest } from '../types/request.type';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Order } from '../enum/order.enum';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const req: AuthRequest = { user: { id: 1, roles: ['1'] } } as any;
  const mockFiles: Express.Multer.File[] = [
    {
      fieldname: 'image',
      originalname: 'file1.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('mockImageData'),
      size: 12345,
      stream: null,
      destination: '',
      filename: 'file1.jpg',
      path: '',
    },
    {
      fieldname: 'image',
      originalname: 'file2.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('mockImageData'),
      size: 12345,
      stream: null,
      destination: '',
      filename: 'file2.jpg',
      path: '',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should return all products with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(service, 'getAll').mockResolvedValue({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    const products = await controller.getAll(
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should products searched by title with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(service, 'search').mockResolvedValue({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    const products = await controller.search(
      { title: 'Test' },
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    expect(service.search).toHaveBeenCalledWith(
      { title: 'Test' },
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );
  });

  it('should products searched by title and price range with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(service, 'search').mockResolvedValue({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    const products = await controller.search(
      { title: 'title', minPrice: 20, maxPrice: 60 },
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    expect(service.search).toHaveBeenCalledWith(
      { title: 'title', minPrice: 20, maxPrice: 60 },
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );
  });

  it('should products searched by title, price range and categories with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(service, 'search').mockResolvedValue({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    const products = await controller.search(
      { title: 'title', minPrice: 20, maxPrice: 60, categoryIds: [1] },
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    expect(service.search).toHaveBeenCalledWith(
      { title: 'title', minPrice: 20, maxPrice: 60, categoryIds: [1] },
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );
  });

  it('should find product by id', async () => {
    const productId = 1;
    const mockProduct = {
      id: 1,
      title: 'title',
      price: 50,
      userId: 1,
      description: 'description',
      images: ['1', '2'],
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'getById').mockResolvedValue(mockProduct);

    const product = await controller.getById(productId);

    expect(service.getById).toHaveBeenCalledWith(productId);
    expect(product).toEqual(mockProduct);
  });

  it('should create product', async () => {
    const productId = 1;
    const dto: CreateProductDto = {
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      categoryIds: [1],
    };
    const mockProduct = {
      id: productId,
      title: dto.title,
      price: dto.price,
      userId: 1,
      description: dto.description,
      images: ['1'],
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'create').mockResolvedValue(mockProduct);

    const product = await controller.create(req, dto, mockFiles);

    expect(service.create).toHaveBeenCalledWith(req.user.id, dto, mockFiles);
    expect(product).toEqual(mockProduct);
  });

  it('should update all fields in product', async () => {
    const productId = 1;
    const userId = 1;
    const dto: UpdateProductDto = {
      title: 'Updated Title',
      description: 'Updated Description',
      price: 100,
      categoryIds: [1],
    };

    const mockProduct = {
      id: productId,
      userId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      images: ['1'],
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'getById').mockResolvedValue(mockProduct);
    jest.spyOn(service, 'update').mockResolvedValue(mockProduct);

    const product = await controller.update(req, dto, productId, mockFiles);

    expect(service.update).toHaveBeenCalledWith(
      req.user.id,
      productId,
      dto,
      mockFiles,
    );
    expect(product).toEqual(mockProduct);
  });

  it('should update only title in product', async () => {
    const productId = 1;
    const userId = 1;
    const dto: UpdateProductDto = {
      title: 'Updated Title',
    };

    const mockProduct = {
      id: productId,
      userId: 1,
      title: dto.title,
      description: 'Old Description',
      price: 50,
      images: ['1'],
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'getById').mockResolvedValue(mockProduct);
    jest.spyOn(service, 'update').mockResolvedValue(mockProduct);

    const product = await controller.update(req, dto, productId);

    expect(service.update).toHaveBeenCalledWith(
      req.user.id,
      productId,
      dto,
      undefined,
    );
    expect(product).toEqual(mockProduct);
  });

  it('should update only price in product', async () => {
    const productId = 1;
    const dto: UpdateProductDto = {
      price: 52,
    };
    const imageNames = ['image1.jpg'];

    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: dto.price,
      images: imageNames,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'getById').mockResolvedValue(mockProduct);
    jest.spyOn(service, 'update').mockResolvedValue(mockProduct);

    const product = await controller.update(req, dto, productId);

    expect(product).toEqual(mockProduct);
  });

  it('should update images in product', async () => {
    const images = ['1.jpg'];

    const dto: UpdateProductDto = {};
    const mockProduct = {
      id: 1,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: 50,
      images,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'getById').mockResolvedValue(mockProduct);
    jest.spyOn(service, 'update').mockResolvedValue(mockProduct);

    const product = await controller.update(req, dto, 1, mockFiles);

    expect(service.update).toHaveBeenCalledWith(req.user.id, 1, dto, mockFiles);
    expect(product).toEqual(mockProduct);
  });

  it('should delete product by id', async () => {
    const mockProduct = {
      id: 1,
      userId: 1,
      price: 22,
      title: 'TEST',
      description: 'Test',
      images: ['13', '14'],
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'getById').mockResolvedValue(mockProduct);

    await controller.delete(req, 1);

    expect(service.delete).toHaveBeenCalledWith(req.user.id, 1);
  });
});
