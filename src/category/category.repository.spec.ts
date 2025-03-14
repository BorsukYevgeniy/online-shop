import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './category.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: PrismaService,
          useValue: {
            category: {
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

    repository = module.get<CategoryRepository>(CategoryRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('should count categories', async () => {
    jest.spyOn(prisma.category, 'count').mockResolvedValue(1);

    const count = await repository.count();

    expect(count).toEqual(1);
  });

  it('should count categories finded by name', async () => {
    jest.spyOn(prisma.category, 'count').mockResolvedValue(1);

    const count = await repository.count('test');

    expect(count).toEqual(1);
  });

  it('should return all categories', async () => {
    const mockCategories = [{ id: 1, name: 'TEST', description: 'TEST' }];

    jest.spyOn(prisma.category, 'findMany').mockResolvedValue(mockCategories);

    const categories = await repository.findAll(0, 1);

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 1,
    });
    expect(categories).toEqual(mockCategories);
  });

  it('should search category', async () => {
    const mockCategories = [{ id: 1, name: 'TEST', description: 'TEST' }];

    jest.spyOn(prisma.category, 'findMany').mockResolvedValue(mockCategories);

    const categories = await repository.findByName('TEST', 0, 1);

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { name: { contains: 'TEST', mode: 'insensitive' } },
      skip: 0,
      take: 1,
    });
    expect(categories).toEqual(mockCategories);
  });

  it('should find category by id', async () => {
    const mockCategories = { id: 1, name: 'TEST', description: 'TEST' };

    jest.spyOn(prisma.category, 'findUnique').mockResolvedValue(mockCategories);

    const categories = await repository.findById(1);

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
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

    jest.spyOn(prisma.category, 'create').mockResolvedValue(mockCategory);
    const category = await repository.create(dto);

    expect(prisma.category.create).toHaveBeenCalledWith({ data: dto });
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

    jest.spyOn(prisma.category, 'update').mockResolvedValue(mockCategory);

    const category = await repository.update(1, dto);

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
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

    jest.spyOn(prisma.category, 'update').mockResolvedValue(mockCategory);
    const category = await repository.update(1, dto);

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
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

    jest.spyOn(prisma.category, 'update').mockResolvedValue(mockCategory);

    const category = await repository.update(1, dto);

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
    expect(mockCategory).toEqual(category);
  });

  it('should remove category', async () => {
    const mockCategory = {
      id: 1,
      name: 'TEST',
      description: 'TEST',
    };

    jest.spyOn(prisma.category, 'delete').mockResolvedValue(mockCategory);

    const category = await repository.delete(1);

    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(category).toEqual(mockCategory);
  });
});
