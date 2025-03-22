import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TokenService } from '../token/token.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductService } from '../product/product.service';

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

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should return all categories', async () => {
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

    const categories = await controller.getAll({ page: 1, pageSize: 1 });

    expect(categoryService.getAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 1,
    });
    expect(categories).toEqual(mockCategories);
  });

  it('should search category', async () => {
    const mockCategories = {
      categories: [{ id: 1, name: 'TEST', description: 'TEST' }],
      total: 1,
      page: 1,
      pageSize: 1,
      prevPage: null,
      nextPage: null,
      totalPages: 1,
    };

    jest.spyOn(categoryService, 'search').mockResolvedValue(mockCategories);

    const categories = await controller.search(
      { name: 'TEST' },
      { page: 1, pageSize: 1 },
    );

    expect(categoryService.search).toHaveBeenCalledWith(
      { name: 'TEST' },
      { page: 1, pageSize: 1 },
    );
    expect(categories).toEqual(mockCategories);
  });

  it('should find category by id', async () => {
    const mockCategories = { id: 1, name: 'TEST', description: 'TEST' };

    jest.spyOn(categoryService, 'getById').mockResolvedValue(mockCategories);

    const categories = await controller.getById(1);

    expect(categoryService.getById).toHaveBeenCalledWith(1);
    expect(categories).toEqual(mockCategories);
  });

  it('should return category products', async () => {
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

    const products = await controller.getCategoryProducts(1, {
      page: 1,
      pageSize: 1,
    });

    expect(productService.getCategoryProducts).toHaveBeenCalledWith(1, {
      page: 1,
      pageSize: 1,
    });
    expect(products).toEqual(mockProducts);
  });

  it('should create category', async () => {
    const dto: CreateCategoryDto = {
      name: 'TEST',
      description: 'TEST',
    };

    const mockCategory = {
      id: 1,
      ...dto,
    };

    jest.spyOn(categoryService, 'create').mockResolvedValue(mockCategory);
    const category = await controller.create(dto);

    expect(categoryService.create).toHaveBeenCalledWith(dto);
    expect(mockCategory).toEqual(category);
  });

  it('should update name in category', async () => {
    const dto: UpdateCategoryDto = {
      name: 'TEST',
    };

    const mockCategory = {
      id: 1,
      description: 'TEST',
      name: dto.name,
    };

    jest.spyOn(categoryService, 'update').mockResolvedValue(mockCategory);
    const category = await controller.update(1, dto);

    expect(categoryService.update).toHaveBeenCalledWith(1, dto);
    expect(mockCategory).toEqual(category);
  });

  it('should update description in category', async () => {
    const dto: UpdateCategoryDto = {
      description: 'TEST',
    };

    const mockCategory = {
      id: 1,
      name: 'TEST',
      description: dto.description,
    };

    jest.spyOn(categoryService, 'update').mockResolvedValue(mockCategory);
    const category = await controller.update(1, dto);

    expect(categoryService.update).toHaveBeenCalledWith(1, dto);
    expect(mockCategory).toEqual(category);
  });

  it('should update all fields in category', async () => {
    const dto: UpdateCategoryDto = {
      description: 'TEST',
      name: 'TEST',
    };

    const mockCategory = {
      id: 1,
      name: dto.name,
      description: dto.description,
    };

    jest.spyOn(categoryService, 'update').mockResolvedValue(mockCategory);
    const category = await controller.update(1, dto);

    expect(categoryService.update).toHaveBeenCalledWith(1, dto);
    expect(mockCategory).toEqual(category);
  });

  it('should remove category', async () => {
    await controller.delete(1);

    expect(categoryService.delete).toHaveBeenCalledWith(1);
  });
});
