import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../enum/role.enum';
import { Order } from '../enum/order.enum';
import { SearchUserDto } from './dto/search-user.dto';
import { UserNoCred } from './types/user.types';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            assignAdmin: jest.fn(),
            count: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findUsers: jest.fn(),
            findUserProducts: jest.fn(),
            findUserProfile: jest.fn(),
            findOneByEmail: jest.fn(),
            findUserRoles: jest.fn(),
            findOneByVerificationLink: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Should assing new admin', () => {
    const mockUser = {
      id: 1,
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: new Date(),
    };

    it.each<[string, boolean]>([
      ['Should assing new admin', true],
      ['Should throw NotFoundException because user not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
        jest.spyOn(repository, 'assignAdmin').mockResolvedValue(mockUser);

        const user = await service.assignAdmin(1);

        expect(user).toEqual(mockUser);
      } else if (!isSuccess) {
        jest.spyOn(repository, 'findById').mockResolvedValue(null);

        expect(repository.assignAdmin).not.toHaveBeenCalled();
        await expect(service.assignAdmin(2)).rejects.toThrow(NotFoundException);
      }
    });
  });

  describe('Should search users with filters wtih default sorting', () => {
    const mockUsers = [
      {
        id: 1,
        nickname: 'test',
        createdAt: new Date(),
        role: Role.USER,
        isVerified: false,
        verifiedAt: new Date(),
      },
    ];

    it.each<[string, SearchUserDto | null]>([
      ['Should return all users with default sorting', null],
      [
        'Should return all users searched by nickname with default sorting',
        { nickname: 'test' },
      ],
      [
        'Should return all users searched by nickname and minDate with default sorting',
        { nickname: 'test', minDate: new Date() },
      ],
      [
        'Should return all users searched by nickname and maxDate with default sorting',
        { nickname: 'test', maxDate: new Date() },
      ],
      [
        'Should return all users searched by nickname and date range with default sorting',
        { nickname: 'test', minDate: new Date(), maxDate: new Date() },
      ],
    ])('%s', async (_, searchUserDto) => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);
      jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

      const users = await service.getAll(
        {
          page: 1,
          pageSize: 10,
        },
        { sortBy: 'id', order: Order.DESC },
        searchUserDto,
      );

      expect(users).toEqual({
        users: mockUsers,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
      });

      expect(repository.findAll).toHaveBeenCalledWith(
        0,
        10,
        {
          sortBy: 'id',
          order: Order.DESC,
        },
        searchUserDto,
      );
      expect(repository.count).toHaveBeenCalledWith(searchUserDto);
    });
  });

  it('Should find user by email', async () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email,
      password: 'password',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };
    jest.spyOn(repository, 'findOneByEmail').mockResolvedValue(mockUser);

    const user = await service.getByEmail(email);

    expect(user).toEqual(mockUser);
  });

  describe('Should find user by id', () => {
    it.each<[string, UserNoCred | null]>([
      [
        'Should find user by id',
        {
          id: 1,
          nickname: 'test',
          createdAt: new Date(),
          role: Role.USER,
          isVerified: false,
          verifiedAt: new Date(),
        },
      ],
      ['Should throw NotFoundException because user not found', null],
    ])('%s', async (_, mockUser) => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);

      if (mockUser) {
        const user = await service.getById(mockUser.id);

        expect(user).toEqual(mockUser);
        expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      } else {
        await expect(service.getById(1)).rejects.toThrow(NotFoundException);
        expect(repository.findById).toHaveBeenCalledWith(1);
      }
    });
  });

  it('Should find user by verification link', async () => {
    const mockUser = {
      id: 1,
      email: 'emai',
      password: 'password',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };
    jest.spyOn(repository, 'findOneByVerificationLink').mockResolvedValue(mockUser);

    const user = await service.getByVerificationLink('123');

    expect(user).toEqual(mockUser)
  });

  it('Should find user profile', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
      verificationLink: '123',
      isVerified: false,
      verifiedAt: new Date(),
    };

    jest.spyOn(repository, 'findUserProfile').mockResolvedValue(mockUser);

    const user = await service.getMe(1);
    expect(user).toEqual(mockUser);
  });

  it('Should create a new user', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      nickname: 'test',
      password: 'password',
    };
    const mockUser = {
      id: 1,
      email: 'test',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
      verificationLink: '123',
      isVerified: false,
      verifiedAt: new Date(),
    };

    jest.spyOn(repository, 'create').mockResolvedValue(mockUser);

    const user = await service.create(dto);

    expect(user).toEqual(mockUser);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  describe('Should delete user', () => {
    it.each<[string, boolean]>([
      ['Should delete user by id', true],
      ['Should throw NotFoundException', true],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        await service.delete(1);

        expect(repository.delete).toHaveBeenCalledWith(1);
      } else {
        jest
          .spyOn(repository, 'delete')
          .mockRejectedValue(new NotFoundException());

        expect(service.delete).rejects.toThrow(NotFoundException);
      }
    });
  });

  it('Should verify user', async () => {
    const mockUser = {
      id: 1,
      email: 'email',
      nickname: 'test',
      password: 'password',
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
    };

    jest.spyOn(repository, 'verify').mockResolvedValue(mockUser);

    const user = await service.verify('123');

    expect(user).toEqual(mockUser);
  });
});
