import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../file/file.service';
import { Order } from '../enum/order.enum';
import { SearchProductDto } from './dto/search-product.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { title } from 'process';
import { ProductCategory } from './types/product.types';

const mockFiles: Express.Multer.File[] = [
  { filename: 'file1.jpg' } as Express.Multer.File,
  { filename: 'file2.jpg' } as Express.Multer.File,
];

describe('ProductService', () => {
  let service: ProductService;
  let fileService: FileService;
  let repository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            count: jest.fn(),
            findAll: jest.fn(),
            findProducts: jest.fn(),
            findById: jest.fn(),
            countCategoryProducts: jest.fn(),
            findCategoryProducts: jest.fn(),
            countUserProducts: jest.fn(),
            findUserProducts: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            createImages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    fileService = module.get<FileService>(FileService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should return user products with default sorting', async () => {
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

    jest.spyOn(repository, 'countUserProducts').mockResolvedValue(1);
    jest.spyOn(repository, 'findUserProducts').mockResolvedValue(mockProducts);

    const products = await service.getUserProducts(
      1,
      {
        page: 1,
        pageSize: 1,
      },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(repository.countUserProducts).toHaveBeenCalledWith(1);
    expect(repository.findUserProducts).toHaveBeenCalledWith(1, 0, 1, {
      sortBy: 'id',
      order: Order.DESC,
    });
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  describe('Should return all products and search him', () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Test',
        price: 20,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
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
        'Should filter products by title and price, range  and category ids with default sorting',
        { title: 'Test', minPrice: 20, maxPrice: 20, categoryIds: [1] },
      ],
    ])('%s', async (_, searchDto) => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);
      jest.spyOn(repository, 'findAll').mockResolvedValue(mockProducts);

      const products = await service.getAll(
        { page: 1, pageSize: 10 },
        { sortBy: 'id', order: Order.DESC },
        searchDto,
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

      expect(repository.findAll).toHaveBeenCalledWith(
        0,
        10,
        {
          sortBy: 'id',
          order: Order.DESC,
        },
        searchDto,
      );

      expect(repository.count).toHaveBeenCalledWith(searchDto);
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
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    it.each<[string, boolean]>([
      ['Should find product by id', true],
      ['Should throw NotFoundException because product not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
        const product = await service.getById(1);

        expect(product).toEqual(mockProduct);
        expect(repository.findById).toHaveBeenCalledWith(1);
      } else {
        jest.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(service.getById(1)).rejects.toThrow(NotFoundException);
      }
    });
  });

  it('Should create product', async () => {
    const userId = 1;
    const images = ['1', '2'];

    const dto: CreateProductDto = {
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      categoryIds: [1],
    };
    const mockProduct = {
      id: 1,
      title: dto.title,
      price: dto.price,
      userId,
      description: dto.description,
      images,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'create').mockResolvedValue(mockProduct);

    const product = await service.create(userId, dto, mockFiles);

    expect(product).toEqual(mockProduct);
  });

  describe('Should update product', () => {
    const mockProduct: ProductCategory = {
      title: 'title',
      description: 'description',
      id: 1,
      images: ['1.png'],
      price: 100,
      userId: 1,
      categories: [{ id: 1, name: 'name', description: 'description' }],
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
        jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
        jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

        if (files)
          jest
            .spyOn(fileService, 'createImages')
            .mockResolvedValue(files.map((file) => file.filename));

        const product = await service.update(
          mockProduct.userId,
          mockProduct.id,
          dto,
          files,
        );

        expect(product).toEqual(mockProduct);
        expect(repository.findById).toHaveBeenCalledWith(mockProduct.id);
        expect(repository.update).toHaveBeenCalledWith(
          mockProduct.id,
          dto,
          files ? files.map((file) => file.filename) : undefined,
        );
      } else if (!isProductFounded && !isSuccess) {
        jest.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(
          service.update(mockProduct.userId, mockProduct.id, dto, files),
        ).rejects.toThrow(NotFoundException);
      } else {
        jest
          .spyOn(repository, 'findById')
          .mockResolvedValue({ ...mockProduct, userId: 2 });

        await expect(
          service.update(mockProduct.userId, mockProduct.id, dto, files),
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
      categories: [{ id: 1, name: 'name', description: 'description' }],
    };

    it.each<[string, boolean, boolean]>([
      ['Should delete product by id', true, true],
      ['Should throw NotFoundException', false, true],
      ['Should throw FobbiddedException', false, true],
    ])('%s', async (_, isSuccess, isProductFounded) => {
      if (isSuccess && isProductFounded) {
        jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);

        await service.delete(1, 1);

        expect(repository.delete).toHaveBeenCalledWith(1);
      } else if (!isSuccess && isProductFounded) {
        jest
          .spyOn(repository, 'findById')
          .mockResolvedValue({ ...mockProduct, userId: 2 });

        await expect(
          service.delete(mockProduct.userId, mockProduct.id),
        ).rejects.toThrow(ForbiddenException);
      } else {
        jest.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(
          service.delete(mockProduct.userId, mockProduct.id),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });
});
