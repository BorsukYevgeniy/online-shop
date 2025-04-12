import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './category.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Order } from '../enum/order.enum';

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

  it('Should count categories', async () => {
    jest.spyOn(prisma.category, 'count').mockResolvedValue(1);

    const count = await repository.count();

    expect(count).toEqual(1);
  });

  it('Should count categories finded by name', async () => {
    jest.spyOn(prisma.category, 'count').mockResolvedValue(1);

    const count = await repository.count('test');

    expect(count).toEqual(1);
  });

  it('Should return all categories with default sorting', async () => {
    const mockCategories = [{ id: 1, name: 'TEST', description: 'TEST' }];

    jest.spyOn(prisma.category, 'findMany').mockResolvedValue(mockCategories);

    const categories = await repository.findAll(0, 1, {
      sortBy: 'id',
      order: Order.DESC,
    });

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 1,
      orderBy: { id: 'desc' },
    });
    expect(categories).toEqual(mockCategories);
  });

  it('Should search category by name with default sorting', async () => {
    const mockCategories = [{ id: 1, name: 'TEST', description: 'TEST' }];

    jest.spyOn(prisma.category, 'findMany').mockResolvedValue(mockCategories);

    const categories = await repository.findByName('TEST', 0, 1, {
      sortBy: 'id',
      order: Order.DESC,
    });

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { name: { contains: 'TEST', mode: 'insensitive' } },
      skip: 0,
      take: 1,
      orderBy: { id: 'desc' },
    });
    expect(categories).toEqual(mockCategories);
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
