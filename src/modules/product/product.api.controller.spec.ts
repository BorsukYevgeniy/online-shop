import { Test, TestingModule } from '@nestjs/testing';
import { ProductApiController } from './product.api.controller';
import { ProductService } from './product.service';
import { TokenService } from '../token/token.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Order } from '../../common/enum/order.enum';
import { SearchProductDto } from './dto/search-product.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '../../common/enum/role.enum';
import { ProductCategory } from './types/product.types';
import { CacheModule } from '@nestjs/cache-manager';
import { TokenPayload } from '../token/interface/token.interfaces';

describe('ProductApiController', () => {
  let controller: ProductApiController;
  let service: ProductService;

  const user:TokenPayload = { id: 1, role: Role.USER, isVerified: true };

  const mockFiles: Express.Multer.File[] = [
    { filename: 'file1.jpg' } as Express.Multer.File,
    { filename: 'file2.jpg' } as Express.Multer.File,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProductApiController],
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

    controller = module.get<ProductApiController>(ProductApiController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('Should return all products and search him with default sorting', () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Test',
        price: 20,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        createdAt: new Date(),
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    it.each<[string, SearchProductDto | null]>([
      ['Should return all products with default sorting', null],
      [
        'Should return all products finded by title with default sorting',
        { title: 'Test' },
      ],
      [
        'Should find category products with default sorting',
        { categoryIds: [1] },
      ],
      [
        'Should filter products by title and and category ids with default sorting',
        { title: 'Test', categoryIds: [1] },
      ],
      [
        'Should return all products finded by title and min price with default sorting',
        { title: 'Test', minPrice: 20 },
      ],
      [
        'Should return all products finded by title and min price with default sorting',
        { title: 'Test', maxPrice: 20 },
      ],
      [
        'Should return all products finded by title and price range with default sorting',
        { title: 'Test', minPrice: 20, maxPrice: 20 },
      ],
      [
        'Should return all products finded by title and price, range  and category ids with default sorting',
        { title: 'Test', minPrice: 20, maxPrice: 20, categoryIds: [1] },
      ],
    ])('%s', async (_, searchDto) => {
      jest.spyOn(service, 'getAll').mockResolvedValue({
        total: 1,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        page: 1,
        pageSize: 10,
        products: mockProducts,
      });

      const products = await controller.getAll(
        searchDto,
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

      expect(service.getAll).toHaveBeenCalledWith(
        { page: 1, pageSize: 10 },
        {
          sortBy: 'id',
          order: Order.DESC,
        },
        searchDto,
      );
    });
  });

  describe('Should find product by id', () => {
    const mockProduct = {
      id: 1,
      title: 'title',
      price: 50,
      userId: 1,
      description: 'description',
      images: ['1', '2'],
      createdAt: new Date(),
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    it.each<[string, boolean]>([
      ['Should find product by id', true],
      ['Should throw NotFoundException because product not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        jest.spyOn(service, 'getById').mockResolvedValue(mockProduct);
        const product = await controller.getById(1);

        expect(product).toEqual(mockProduct);
        expect(service.getById).toHaveBeenCalledWith(1);
      } else {
        jest
          .spyOn(service, 'getById')
          .mockRejectedValue(new NotFoundException('Product not found'));

        await expect(controller.getById(1)).rejects.toThrow(NotFoundException);
      }
    });
  });

  it('Should create product', async () => {
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
      createdAt: new Date(),
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(service, 'create').mockResolvedValue(mockProduct);

    const product = await controller.create(user, dto, mockFiles);

    expect(service.create).toHaveBeenCalledWith(user.id, dto, mockFiles);
    expect(product).toEqual(mockProduct);
  });

  describe('Should update product', () => {
    const mockProduct = {
      id: 1,
      title: 'Updated Title',
      price: 100,
      userId: 1,
      description: 'Description',
      images: ['1', '2'],
      createdAt: new Date(),
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    it.each<
      [string, UpdateProductDto, Express.Multer.File[] | null, boolean, boolean]
    >([
      [
        'Should update all fields in product',
        {
          title: 'Updated Title',
          price: 100,
          categoryIds: [1],
          description: 'Description',
        },
        mockFiles,
        true,
        true,
      ],
      [
        'Should update title in product',
        { title: 'Updated Title' },
        null,
        true,
        true,
      ],
      [
        'Should update description in product',
        { description: 'Updated Description' },
        null,
        true,
        true,
      ],
      ['Should update price in product', { price: 52 }, null, true, true],
      [
        'Should update categories in product',
        { categoryIds: [1, 2] },
        null,
        true,
        true,
      ],
      ['Should update images in product', {}, mockFiles, true, true],
      ['Should throw ForbiddenException', {}, null, false, true],
      ['Should throw NotFoundException', {}, null, false, false],
    ])('%s', async (_, dto, files, isSuccess, isProductFounded) => {
      if (isSuccess && isProductFounded) {
        jest.spyOn(service, 'update').mockResolvedValue(mockProduct);

        const product = await controller.update(
          user,
          mockProduct.id,
          dto,
          files,
        );

        expect(product).toEqual(mockProduct);
        expect(service.update).toHaveBeenCalledWith(
          user.id,
          mockProduct.id,
          dto,
          files,
        );
      } else if (!isProductFounded && !isSuccess) {
        jest
          .spyOn(service, 'update')
          .mockRejectedValue(new NotFoundException('Product not found'));

        await expect(
          controller.update(user, mockProduct.id, dto, files),
        ).rejects.toThrow(NotFoundException);
      } else {
        jest
          .spyOn(service, 'update')
          .mockRejectedValue(new ForbiddenException());

        await expect(
          controller.update(user, mockProduct.id, dto, files),
        ).rejects.toThrow(ForbiddenException);
      }
    });
  });

  describe('Should delete product by id', () => {
    const mockProduct: ProductCategory = {
      title: 'title',
      description: 'description',
      id: 1,
      images: ['1.png'],
      price: 100,
      userId: 1,
      createdAt: new Date(),
      categories: [{ id: 1, name: 'name', description: 'description' }],
    };

    it.each<[string, boolean, boolean]>([
      ['Should delete product by id', true, true],
      ['Should throw NotFoundException', false, true],
      ['Should throw FobbiddedException', false, true],
    ])('%s', async (_, isSuccess, isProductFounded) => {
      if (isSuccess && isProductFounded) {
        jest.spyOn(service, 'delete').mockResolvedValue();

        await controller.delete(user, 1);

        expect(service.delete).toHaveBeenCalledWith(1, 1);
      } else if (!isSuccess && isProductFounded) {
        jest
          .spyOn(service, 'delete')
          .mockRejectedValue(new ForbiddenException());

        await expect(
          service.delete(mockProduct.userId, mockProduct.id),
        ).rejects.toThrow(ForbiddenException);
      } else {
        jest
          .spyOn(service, 'delete')
          .mockRejectedValue(new NotFoundException());

        await expect(
          service.delete(mockProduct.userId, mockProduct.id),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });
});
