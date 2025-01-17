import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TokenService } from '../token/token.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            searchCategory: jest.fn(),
            findCategoryProducts: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
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

    jest.spyOn(service, 'findAll').mockResolvedValue(mockCategories);

    const categories = await controller.findAll({ page: 1, pageSize: 1 });

    expect(service.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 1 });
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

    jest.spyOn(service, 'searchCategory').mockResolvedValue(mockCategories);

    const categories = await controller.searchCategory(
      { name: 'TEST' },
      { page: 1, pageSize: 1 },
    );

    expect(service.searchCategory).toHaveBeenCalledWith(
      { name: 'TEST' },
      { page: 1, pageSize: 1 },
    );
    expect(categories).toEqual(mockCategories);
  });

  it('should find category by id', async () => {
    const mockCategories = { id: 1, name: 'TEST', description: 'TEST' };

    jest.spyOn(service, 'findOne').mockResolvedValue(mockCategories);

    const categories = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
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

    jest.spyOn(service, 'findCategoryProducts').mockResolvedValue(mockProducts);

    const products = await controller.getCategoryProduct(1, {
      page: 1,
      pageSize: 1,
    });

    expect(service.findCategoryProducts).toHaveBeenCalledWith(1, {
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

    jest.spyOn(service, 'create').mockResolvedValue(mockCategory);
    const category = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
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

    jest.spyOn(service, 'update').mockResolvedValue(mockCategory);
    const category = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
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

    jest.spyOn(service, 'update').mockResolvedValue(mockCategory);
    const category = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
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

    jest.spyOn(service, 'update').mockResolvedValue(mockCategory);
    const category = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(mockCategory).toEqual(category);
  });

  it('should remove category', async () => {
    const mockCategory = {
      id: 1,
      name: 'TEST',
      description: 'TEST',
    };

    jest.spyOn(service, 'remove').mockResolvedValue(mockCategory);
    await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
