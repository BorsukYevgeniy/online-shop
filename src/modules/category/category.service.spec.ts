import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Order } from '../../common/enum/order.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SearchCategoryDto } from './dto/search-category.dto';

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

  it('Should be defined', async () => {
    expect(service).toBeDefined();
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

      jest.spyOn(repository, 'count').mockResolvedValue(mockCategories.total);
      jest
        .spyOn(repository, 'findAll')
        .mockResolvedValue(mockCategories.categories);

      const categories = await service.getAll(
        { page: 1, pageSize: 1 },
        { sortBy: 'id', order: Order.DESC },
        searchDto,
      );

      expect(repository.findAll).toHaveBeenCalledWith(
        0,
        1,
        { sortBy: 'id', order: Order.DESC },
        searchDto,
      );
      expect(repository.count).toHaveBeenCalledWith(searchDto);

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

        jest.spyOn(repository, 'findById').mockResolvedValue(mockCategories);

        const categories = await service.getById(1);

        expect(repository.findById).toHaveBeenCalledWith(1);
        expect(categories).toEqual(mockCategories);
      } else {
        jest.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(service.getById(0)).rejects.toThrow(NotFoundException);
      }
    });
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

        jest.spyOn(repository, 'create').mockResolvedValue(mockCategory);

        const category = await service.create(dto);

        expect(repository.create).toHaveBeenCalledWith(dto);
        expect(mockCategory).toEqual(category);
      } else {
        jest.spyOn(repository, 'create').mockRejectedValue(
          new PrismaClientKnownRequestError('Category already exists', {
            clientVersion: '4.0.0',
            code: 'P2002',
          }),
        );

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      }
    });
  });

  describe('Should update category', () => {
    it.each<[string, UpdateCategoryDto]>([
      ['Should update name in category', { name: 'TEST' }],
      ['Should update description in category', { description: 'TEST' }],
      [
        'Should update all fields in category',
        { name: 'TEST', description: 'TEST' },
      ],
      ['Should throw NotFoundException because category not found', {}],
    ])('%s', async (_, dto) => {
      if (dto) {
        const mockCategory = {
          id: 1,
          name: 'TEST',
          description: 'Test',
          ...dto,
        };

        jest.spyOn(repository, 'update').mockResolvedValue(mockCategory);

        const category = await service.update(1, dto);

        expect(repository.update).toHaveBeenCalledWith(1, dto);
        expect(mockCategory).toEqual(category);
      } else {
        jest.spyOn(repository, 'update').mockRejectedValue(
          new PrismaClientKnownRequestError('Category not found', {
            clientVersion: '4.0.0',
            code: 'P2025',
          }),
        );

        await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
      }
    });
  });

  describe('Should delete category', () => {
    it.each<[string, number]>([
      ['Should delete category', 1],
      ['Should throw NotFoundException because category not found', 0],
    ])('%s', async (_, id) => {
      if (id) {
        jest.spyOn(repository, 'delete').mockResolvedValue(undefined);
        await service.delete(id);

        expect(repository.delete).toHaveBeenCalledWith(id);
      } else {
        jest.spyOn(repository, 'delete').mockRejectedValue(
          new PrismaClientKnownRequestError('Category not found', {
            clientVersion: '4.0.0',
            code: 'P2025',
          }),
        );
        await expect(service.delete(id)).rejects.toThrow(NotFoundException);
      }
    });
  });
});
