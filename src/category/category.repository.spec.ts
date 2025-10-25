import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './category.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Order } from '../common/enum/order.enum';
import { SearchCategoryDto } from './dto/search-category.dto';

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

  it('Should be defined', async () => {
    expect(repository).toBeDefined();
  });

  describe('Should count categories with filters', () => {
    it.each<[string, SearchCategoryDto | null]>([
      ['Should count all categories', null],
      ['Should count categories with name filter', { name: 'TEST' }],
    ])('%s', async (_, searchDto) => {
      jest.spyOn(prisma.category, 'count').mockResolvedValue(1);

      const count = await repository.count(searchDto);

      expect(prisma.category.count).toHaveBeenCalledWith({
        where: { name: { contains: searchDto?.name, mode: 'insensitive' } },
      });
      expect(count).toEqual(1);
    });
  });

  describe('should return all categories and search him', () => {
    it.each<[string, SearchCategoryDto | null]>([
      ['Should return all categories', null],
      ['Should search category by name', { name: 'TEST' }],
    ])('%s', async (_, searchDto) => {
      const mockCategories = [{ id: 1, name: 'TEST', description: 'TEST' }];

      jest.spyOn(prisma.category, 'findMany').mockResolvedValue(mockCategories);

      const categories = await repository.findAll(
        0,
        1,
        {
          sortBy: 'id',
          order: Order.DESC,
        },
        searchDto,
      );

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { name: { contains: searchDto?.name, mode: 'insensitive' } },
        skip: 0,
        take: 1,
        orderBy: { id: 'desc' },
      });
      expect(categories).toEqual(mockCategories);
    });
  });

  it('Should find category by id', async () => {
    const mockCategories = { id: 1, name: 'TEST', description: 'TEST' };

    jest.spyOn(prisma.category, 'findUnique').mockResolvedValue(mockCategories);

    const categories = await repository.findById(1);

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(categories).toEqual(mockCategories);
  });

  it('Should create category', async () => {
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

  describe('Should update category', () => {
    it.each<[string, UpdateCategoryDto]>([
      ['Should update name in category', { name: 'New name' }],
      [
        'Should update description in category',
        { description: 'New description' },
      ],
      [
        'Should update name and description in category',
        { name: 'New name', description: 'New description' },
      ],
    ])('%s', async (_, updateCategoryDto) => {
      const mockCategory = {
        id: 1,
        name: 'TEST',
        description: 'TEST',
        ...updateCategoryDto,
      };

      jest.spyOn(prisma.category, 'update').mockResolvedValue(mockCategory);

      const category = await repository.update(1, updateCategoryDto);

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateCategoryDto,
      });
      expect(mockCategory).toEqual(category);
    });
  });

  it('Should remove category', async () => {
    const mockCategory = {
      id: 1,
      name: 'TEST',
      description: 'TEST',
    };

    jest.spyOn(prisma.category, 'delete').mockResolvedValue(mockCategory);

    await repository.delete(1);

    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
