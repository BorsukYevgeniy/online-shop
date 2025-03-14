import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: CategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {
            count: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<CategoryRepository>(CategoryRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
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

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest
      .spyOn(repository, 'findAll')
      .mockResolvedValue(mockCategories.categories);

    const categories = await service.getAll({ page: 1, pageSize: 1 });

    expect(repository.findAll).toHaveBeenCalledWith(0, 1);
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

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest
      .spyOn(repository, 'findByName')
      .mockResolvedValue(mockCategories.categories);

    const categories = await service.search(
      { name: 'TEST' },
      { page: 1, pageSize: 1 },
    );

    expect(repository.findByName).toHaveBeenCalledWith('TEST', 0, 1);
    expect(categories).toEqual(mockCategories);
  });

  it('should find category by id', async () => {
    const mockCategories = { id: 1, name: 'TEST', description: 'TEST' };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockCategories);

    const categories = await service.getById(1);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(categories).toEqual(mockCategories);
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

    jest.spyOn(repository, 'create').mockResolvedValue(mockCategory);
    const category = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
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

    jest.spyOn(repository, 'update').mockResolvedValue(mockCategory);

    const category = await service.update(1, dto);

    expect(repository.update).toHaveBeenCalledWith(1, dto);
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

    jest.spyOn(repository, 'update').mockResolvedValue(mockCategory);
    const category = await service.update(1, dto);

    expect(repository.update).toHaveBeenCalledWith(1, dto);
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

    jest.spyOn(repository, 'update').mockResolvedValue(mockCategory);

    const category = await service.update(1, dto);

    expect(repository.update).toHaveBeenCalledWith(1, dto);
    expect(mockCategory).toEqual(category);
  });

  it('should remove category', async () => {
    const mockCategory = {
      id: 1,
      name: 'TEST',
      description: 'TEST',
    };

    jest.spyOn(repository, 'delete').mockResolvedValue(mockCategory);

    const category = await service.delete(1);

    expect(repository.delete).toHaveBeenCalledWith(1);
    expect(category).toEqual(mockCategory);
  });
});
