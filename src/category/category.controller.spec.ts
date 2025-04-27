import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TokenService } from '../token/token.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductService } from '../product/product.service';
import { Order } from '../enum/order.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SearchCategoryDto } from './dto/search-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
            search: jest.fn(),
            getCategoryById: jest.fn(),
            getCategoryProducts: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
        {
          provide: ProductService,
          useValue: {
            getCategoryProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
    productService = module.get<ProductService>(ProductService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('Should return all categories and search him', () => {
    it.each<[string, SearchCategoryDto | null]>([
      ['Should return all categories', null],
      ['Should search category by name', { name: 'TEST' }],
    ])('%s', async (_, searchDto) => {
      const mockCategories = {
        categories: [{ id: 1, name: 'TEST', description: 'TEST' }],
        total: 1,
        page: 1,
        pageSize: 1,
        prevPage: null,
        nextPage: null,
        totalPages: 1,
      };

      jest.spyOn(categoryService, 'getAll').mockResolvedValue(mockCategories);

      const categories = await controller.getAll(
        { page: 1, pageSize: 1 },
        { sortBy: 'id', order: Order.DESC },
        searchDto,
      );

      expect(categoryService.getAll).toHaveBeenCalledWith(
        { page: 1, pageSize: 1 },
        { sortBy: 'id', order: Order.DESC },
        searchDto,
      );
      expect(categories).toEqual(mockCategories);
    });
  });

  describe('Should find category by id', () => {
    it.each<[string, boolean]>([
      ['Should find category by id', true],
      ['Should throw NotFoundException because category not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        const mockCategories = { id: 1, name: 'TEST', description: 'TEST' };

        jest
          .spyOn(categoryService, 'getById')
          .mockResolvedValue(mockCategories);

        const categories = await controller.getById(1);

        expect(categoryService.getById).toHaveBeenCalledWith(1);
        expect(categories).toEqual(mockCategories);
      } else {
        jest
          .spyOn(categoryService, 'getById')
          .mockRejectedValue(new NotFoundException('Category not found'));

        await expect(controller.getById(0)).rejects.toThrow(NotFoundException);
      }
    });
  });

  it('Should return category products', async () => {
    const mockProducts = {
      products: [
        {
          id: 1,
          title: 'test',
          description: 'test',
          price: 1,
          userId: 1,
          images: ['1'],
          categories: [1, 2],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 1,
      nextPage: null,
      prevPage: null,
      totalPages: 1,
    };

    jest
      .spyOn(productService, 'getCategoryProducts')
      .mockResolvedValue(mockProducts);

    const products = await controller.getCategoryProducts(
      1,
      {
        page: 1,
        pageSize: 1,
      },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(productService.getCategoryProducts).toHaveBeenCalledWith(
      1,
      {
        page: 1,
        pageSize: 1,
      },
      { sortBy: 'id', order: Order.DESC },
    );
    expect(products).toEqual(mockProducts);
  });

  describe('Should create category', () => {
    it.each<[string, CreateCategoryDto, boolean]>([
      [
        'Should create category',
        { name: 'Category', description: 'Description' },
        true,
      ],
      [
        'Should throw BadRequestException because category already exists',
        { name: 'Category', description: 'Description' },
        true,
      ],
    ])('%s', async (_, dto, isSuccess) => {
      if (isSuccess) {
        const mockCategory = {
          id: 1,
          ...dto,
        };

        jest.spyOn(categoryService, 'create').mockResolvedValue(mockCategory);

        const category = await controller.create(dto);

        expect(categoryService.create).toHaveBeenCalledWith(dto);
        expect(mockCategory).toEqual(category);
      } else {
        jest
          .spyOn(categoryService, 'create')
          .mockRejectedValue(
            new BadRequestException('Category already exists', {}),
          );

        await expect(controller.create(dto)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  describe('Should update category', () => {
    it.each<[string, UpdateCategoryDto, boolean]>([
      ['Should update name in category', { name: 'TEST' }, true],
      ['Should update description in category', { description: 'TEST' }, true],
      [
        'Should update all fields in category',
        { name: 'TEST', description: 'TEST' },
        true,
      ],
      ['Should throw NotFoundException because product not found', {}, false],
    ])('%s', async (_, dto, isSuccess) => {
      if (isSuccess) {
        const mockCategory = {
          id: 1,
          name: 'TEST',
          description: 'Test',
          ...dto,
        };

        jest.spyOn(categoryService, 'update').mockResolvedValue(mockCategory);

        const category = await controller.update(1, dto);

        expect(categoryService.update).toHaveBeenCalledWith(1, dto);
        expect(mockCategory).toEqual(category);
      } else {
        jest
          .spyOn(categoryService, 'update')
          .mockRejectedValue(new NotFoundException('Category not found'));
        await expect(controller.update(1, dto)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  describe('Should delete category', () => {
    it.each<[string, number]>([
      ['Should delete category', 1],
      ['Should throw NotFoundException because category not found', 0],
    ])('%s', async (_, id) => {
      if (id) {
        jest.spyOn(categoryService, 'delete').mockResolvedValue(undefined);
        await controller.delete(id);

        expect(categoryService.delete).toHaveBeenCalledWith(id);
      } else {
        jest
          .spyOn(categoryService, 'delete')
          .mockRejectedValue(new NotFoundException('Category not found'));
        await expect(controller.delete(id)).rejects.toThrow(NotFoundException);
      }
    });
  });
});
